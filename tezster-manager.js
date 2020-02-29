'use strict';
const cliColors = {
        red : '31m',
        yellow : '33m',
        cyan : '36m',
        white : '37m',
        green : '32m',
    },
    confFile = __dirname + '/config.json',
    jsonfile = require('jsonfile');

var eztz = {}, 
    config = jsonfile.readFileSync(confFile);

const ConseilJS = './lib/conseiljs';
async function loadTezsterConfig() {
    eztz = require('./lib/eztz.cli.js').eztz;
    const jsonfile = require('jsonfile');
    config=jsonfile.readFileSync(confFile);
    if (config.provider) {
        eztz.node.setProvider(config.provider);
    }  
    const _sodium = require('libsodium-wrappers');
    await _sodium.ready;
    eztz.library.sodium = _sodium;
}

function findKeyObj(list, t){
    for (var i = 0; i < list.length; i++){
      if (list[i].pkh == t || list[i].label == t) return list[i];
    }
    return false;
}

function outputError(e){
    return '\x1b['+cliColors.red+'Error: '+e.toString().replace('Error:','')+'\x1b[0m';
}

function outputInfo(e){
    return '\x1b['+cliColors.yellow+e+'\x1b[0m';
}

function output(e){
    return '\x1b['+cliColors.green+e+'\x1b[0m';
}

function addContract(label, opHash, pkh) {
  config.contracts.push({
    label : label,
    pkh : opHash,
    identity : pkh,
  });
  jsonfile.writeFile(confFile, config);
}

function addIdentity(label, sk, pk, pkh, secret) {
  config.identities.push({
    sk : sk,
    pk: pk,
    pkh : pkh,
    label : label,
    secret: secret || ''
  });
  jsonfile.writeFile(confFile, config);
}

function addTransaction(operation, opHash, from, to, amount) {
  config.transactions.push({
    operation : operation,
    hash : opHash,
    from : from,
    to: to,
    amount: amount
  });
  jsonfile.writeFile(confFile, config);
}

function addAccount(label, pkh, identity) {
  config.accounts.push({
    label : label,
    pkh : pkh,
    identity : identity
  });
  jsonfile.writeFile(confFile, config);
}

function getKeys(account) {
  let keys,f;
  if (f = findKeyObj(config.identities, account)) {
    keys = f;
  } else if (f = findKeyObj(config.accounts, account)) {
    keys = findKeyObj(config.identities, f.identity);
  } else if (f = findKeyObj(config.contracts, account)) {
    keys = findKeyObj(config.identities, f.identity);
  }

  return keys;
}

async function invokeContract(contract, argument, account) {
  const conseiljs = require(ConseilJS);
  const tezosNode = config.provider;
  const keys = getKeys(account);
  if(!keys) {
    return outputError(`Couldn't find keys for given account.
      Please make sure the account exists and added to tezster. Run 'tezster list-accounts to get all accounts`);
  }
  const keystore = {
      publicKey: keys.pk,
      privateKey: keys.sk,
      publicKeyHash: keys.pkh,
      seed: '',
      storeType: conseiljs.StoreType.Fundraiser
  };

  let contractAddress = '';
  let contractObj = findKeyObj(config.contracts, contract);
  if (contractObj) {
    contractAddress = contractObj.pkh;
  }
  
  if (!contractAddress) {
    return outputError(`couldn't find the contract, please make sure contract label or address is correct!`);
  }

  try {
    const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(
                                tezosNode, keystore, contractAddress, 0, 100000, '', 1000, 100000, undefined, 
                                argument, conseiljs.TezosParameterFormat.Michelson);
    
    if (result.results) {
      switch(result.results.contents[0].metadata.operation_result.status) {
        case 'applied':
            let opHash = result.operationGroupID.slice(1,result.operationGroupID.length-2);
            addTransaction('contract-call', opHash, keys.pkh, contractObj.label, 0);
            return output(`Injected operation with hash ${opHash}`);

        case 'failed':
        default:
            return outputError(`Contract calling has failed : ${JSON.stringify(result.results.contents[0].metadata.operation_result)}`)
      }
    }
    return outputError(`Contract calling has failed : ${JSON.stringify(result)}`);
  }
  catch(error) {
    return outputError(error);
  }
}

async function getStorage(contract) {
  let contractAddress = '';
  let contractObj = findKeyObj(config.contracts, contract);
  if (contractObj) {
    contractAddress = contractObj.pkh;
  }

  if (!contractAddress) {
    return outputError(`couldn't find the contract, please make sure contract label or address is correct!`);
  }

  try {
    let storage = await eztz.contract.storage(contractAddress);
    return output(JSON.stringify(storage));
  }
  catch(error) {
    return outputError(error);
  }
}

function restoreAlphanetAccount(accountLabel, accountFilePath) {
  const fs = require("fs");
  const keys = getKeys(accountLabel);
  if(keys) {
    return outputError(` Account with this label already exists.`);
  }
  try {
    let accountJSON = fs.readFileSync(accountFilePath, 'utf8');
    accountJSON = accountJSON && JSON.parse(accountJSON);
    if(!accountJSON) {
      return outputError(` occured while restroing account : empty JSON file`);
    }
    let mnemonic = accountJSON.mnemonic;
    let email = accountJSON.email;
    let password = accountJSON.password;
    if (!mnemonic || !email || !password) {
      return outputError(` occured while restroing account : invalid JSON file`);
    }
    mnemonic = mnemonic.join(' ');
    
    /* 
    make sure eztz.cli.js uses 'mnemonicToSeedSync' under 'generateKeys' always.
    */
    const alphakeys = eztz.crypto.generateKeys(mnemonic, email+password);

    addIdentity(accountLabel, alphakeys.sk, alphakeys.pk, alphakeys.pkh, accountJSON.secret);
    addAccount('aplha_'+ accountLabel, alphakeys.pkh, accountLabel);
    return output(`successfully restored testnet faucet account: ${accountLabel}-${alphakeys.pkh}`);
  } catch(error) {
    return outputError(` occured while restroing account : ${error}`);
  }
}

async function activateAlphanetAccount(account) {
  const keys = getKeys(account);
  if(!keys || !keys.secret) {
    return outputError(`Couldn't find keys for given account.
      Please make sure the account exists and added to tezster.`);
  }

  try {
    let activationResult = await eztz.rpc.activate(keys.pkh, keys.secret);
    return output(`successfully activated testnet faucet account: ${keys.label} : ${keys.pkh} \n with tx hash: ${activationResult}`);
  } catch(error) {
    return outputError(` occured while activating account : ${error}`);
  }
}

function addContractToConfig(contractLabel, contractAddr) {
  let contractObj = findKeyObj(config.contracts, contractLabel);
  if (contractObj) {
    return outputError(`This contract label is already in use. Please use a different one.`);
  }

  addContract(contractLabel, contractAddr, '');
}

module.exports= {
    loadTezsterConfig: loadTezsterConfig,
    findKeyObj : findKeyObj,
    getKeys: getKeys,
    outputInfo: outputInfo,
    outputError: outputError,
    output:output,
    config: config,
    eztz: eztz,

    addContract: addContractToConfig,
    addTransaction: addTransaction,
    invokeContract: invokeContract,
    getStorage: getStorage,
    restoreAlphanetAccount: restoreAlphanetAccount,
    activateAlphanetAccount : activateAlphanetAccount
};
