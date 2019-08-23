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
             "bake-for- To complete transaction run bake-for for account label\n" + 
             "deploy [contract-label] [contract-absolute-path] [init-storage-value] - deploys a smart contract written in Michelson\n" +
             "call [contract-name/address] [argument-value] - calls a smart contract with give value provided in Michelson format\n";
var eztz = {}, 
    config = jsonfile.readFileSync(confFile);

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

    fees = fees || 1400;

    return eztz.rpc.transfer(from, keys, to, amount, 1400, undefined, 10200).then(function(r){
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
    return '\x1b['+cliColors.red+'Error :'+e+'\x1b[0m';
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

async function deployContract(contractLabel, contractPath, initValue) {
  const fs = require("fs");
  const conseiljs = require('conseiljs');
  const tezosNode = config.provider;
  const keys = getKeys('bootstrap1');
  const keystore = {
      publicKey: keys.pk,
      privateKey: keys.sk,
      publicKeyHash: keys.pkh,
      seed: '',
      storeType: conseiljs.StoreType.Fundraiser
  };
  try {
    const contract = fs.readFileSync(contractPath, 'utf8');
    const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
                              tezosNode, keystore, 0, undefined, false,
                              true, 100000, '', 1000, 100000, 
                              contract, initValue, conseiljs.TezosParameterFormat.Michelson);
    let opHash = result.operationGroupID.slice(1,result.operationGroupID.length-2);
    opHash = eztz.contract.hash(opHash);
    addContract(contractLabel, opHash , keys.pkh);
    return output(`contract ${contractLabel} has been deployed at ${opHash}`);
  } catch(error) {
    return outputError(error);
  }
}

async function invokeContract(contract, argument) {
  const conseiljs = require('conseiljs');
  const tezosNode = config.provider;
  const keys = getKeys('bootstrap1');
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
                                tezosNode, keystore, contractAddress, 0, 100000, '', 1000, 100000, argument, 
                                conseiljs.TezosParameterFormat.Michelson);
    if (result.operationGroupID.indexOf('error') >= 0 || result.operationGroupID.indexOf('Error') >= 0) {
      return outputError(result.operationGroupID);
    }
    let opHash = result.operationGroupID.slice(1,result.operationGroupID.length-2);
    addTransaction('contract-call', opHash, keys.pkh, contractObj.label, 0);
    return output(`Injected operation with hash ${opHash}`);
  }
  catch(error) {
    return outputError(error);
  }
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
    addContract: addContract,
    addTransaction: addTransaction,
    createAccount:createAccount,
    helpData:helpData,
    deployContract:  deployContract,
    invokeContract: invokeContract
};
