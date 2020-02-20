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
var helpData="Usage: tezster [command] [optional parameters].....\n" +
             "Tezster comes in an npm package with a set of easy commands to kickstart the development or interaction with Tezos. The current beta version will install and start tezos node on your local machine.\n\n" +
             "Most used commands:\n" + 
             "setup- setting up tezos node\n" + 
             "start-nodes- starting the nodes\n" + 
             "stop-nodes- stopping the nodes\n" + 
             "create-account [Indentity][Label][amount]- To create a new account.\n" + 
             "get-balance [account/contract(pkh)]- To get the balance of account/contracts\n" + 
             "transfer [amount][from][to][fees]- To transfer the funds b/w accounts\n" + 
             "list-accounts- To fetch all the accounts\n" +
             "list-contracts- To fetch all the contracts\n" + 
             "set-provider [http://{ip}:{port}]- To change the default provider\n" + 
             "get-provider- To fetch the current provider\n" + 
             "deploy [contract-label] [contract-absolute-path] [init-storage-value] [account] - deploys a smart contract written in Michelson\n" +
             "call [contract-name/address] [argument-value] [account]- calls a smart contract with give value provided in Michelson format\n" +
             "get-storage [contract-name/address] - returns current storage for given smart contract\n" + 
             "add-testnet-account <account-label> <absolut-path-to-json-file> - restores an testnet faucet account from json file\n" +
             "activate-testnet-account <account-label> - activates an testnet faucet account resored using tezster\n" +
             "add-contract <label> <Address> - adds a smart contract with label for interaction";

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

function formatTez(a){
    return formatMoney(a)+" ꜩ";
}

function formatMoney(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function getBalance(account) {
    var pkh = account, f;
    if (f = findKeyObj(config.identities, pkh)) {
    pkh = f.pkh;
    } else if (f = findKeyObj(config.accounts, pkh)) {
    pkh = f.pkh;
    } else if (f = findKeyObj(config.contracts, pkh)) {
    pkh = f.pkh;
    }
    return eztz.rpc.getBalance(pkh).then(function(r){
        return output(formatTez(r/100));
    }).catch(function(e){
        return outputError(e);
    });
}

function getProvider(){    
    if (config.provider){
        return outputInfo(config.provider);
    }else{
        return outputInfo("No provider is set");
    } 
}

function setProvider(args){    
    config.provider = args[0];
    jsonfile.writeFile(confFile, config);
    eztz.node.setProvider(config.provider);
    return outputInfo("Provider updated to " + config.provider);
}

function transferAmount(args){    
    var amount = parseFloat(args[0]), from = args[1], to = args[2],
        fees = args[3], f;
    var keys = "main"; 
    if (f = findKeyObj(config.identities, from)) {
      keys = f;
      from = f.pkh;
    } else if (f = findKeyObj(config.accounts, from)) {
      keys = findKeyObj(config.identities, f.identity);
      from = f.pkh;
    } else if (f = findKeyObj(config.contracts, from)) {
      keys = findKeyObj(config.identities, f.identity);
      from = f.pkh;
    } else {
      return outputError("No valid identity to send this transaction");
    }
    
    if (f = findKeyObj(config.identities, to)) {
      to = f.pkh;
    } else if (f = findKeyObj(config.accounts, to)) {
      to = f.pkh;
    } else if (f = findKeyObj(config.contracts, to)) {
      to = f.pkh;
    }

    fees = fees || 1500;

    return eztz.rpc.transfer(from, keys, to, amount, fees, undefined, 10600).then(function(r){
      addTransaction('transfer', r.hash, from, to, amount);
      return output("Transfer complete - operation hash #" + r.hash);
    }).catch(function(e){
      return outputError(e);
    });
    
}

function createAccount(args){
  var pkh = args[0], f;  
  if (findKeyObj(config.accounts, args[1])) return console.log(outputError("That account name is already in use"));
  if (f = findKeyObj(config.identities, pkh)) {
      return eztz.rpc.account(f, parseFloat(args[2]), true, true,f.pkh, 1400).then(function(r){                  
              var d=eztz.contract.hash(r.hash, 0);        
              config.accounts.push({
                label : args[1],
                pkh : d,
                identity : pkh,        
              });
              jsonfile.writeFile(confFile, config);
              return output("New account created " + args[1]);
          }).catch(function(e){           
              return outputError(e);
            });
  } else {
      return outputError(pkh + " is not a valid identity");
  }
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

async function deployContract(contractLabel, contractPath, initValue, account) {
  const fs = require("fs");
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

  let contractObj = findKeyObj(config.contracts, contractLabel);
  if (contractObj) {
    return outputError(`This contract label is already in use. Please use a different one.`);
  }

  try {
    const contract = fs.readFileSync(contractPath, 'utf8');
    const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
                              tezosNode, keystore, 0, undefined,
                              100000, '', 1000, 100000, 
                              contract, initValue, conseiljs.TezosParameterFormat.Michelson);
    if (result.results) {
      switch(result.results.contents[0].metadata.operation_result.status) {
        case 'applied':
            let opHash = result.operationGroupID.slice(1,result.operationGroupID.length-2);
            opHash = eztz.contract.hash(opHash);
            addContract(contractLabel, opHash , keys.pkh);
            return output(`contract ${contractLabel} has been deployed at ${opHash}`);

        case 'failed':
        default:
            return outputError(`Contract deployment has failed : ${JSON.stringify(result.results.contents[0].metadata.operation_result)}`)
      }
    }
    return outputError(`Contract deployment has failed : ${JSON.stringify(result)}`);
  } catch(error) {
    return outputError(error);
  }
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
    getBalance: getBalance,
    outputInfo: outputInfo,
    outputError: outputError,
    output:output,
    config: config,
    eztz: eztz,
    getProvider: getProvider,
    setProvider: setProvider,
    transferAmount: transferAmount,
    addContract: addContractToConfig,
    addTransaction: addTransaction,
    createAccount:createAccount,
    helpData:helpData,
    deployContract:  deployContract,
    invokeContract: invokeContract,
    getStorage: getStorage,
    restoreAlphanetAccount: restoreAlphanetAccount,
    activateAlphanetAccount : activateAlphanetAccount
};
