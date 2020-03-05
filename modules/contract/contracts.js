const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var eztz = {};
var config = jsonfile.readFileSync(confFile);
const ConseilJS = '../../lib/conseiljs';

const {Helper} = require('../../helper');

class Contracts{

constructor(){  
    this.helper = new Helper();
}

confFile = __dirname + '/../../config.json';
jsonfile = require('jsonfile');
config = jsonfile.readFileSync(confFile);

async _listContracts() {
    await this.loadTezsterConfig();    
    const config = this.config;
    if(Object.keys(config.contracts).length > 0){        
        for(var i in config.contracts){
            console.log(this.helper.output(config.contracts[i].label + " - " + config.contracts[i].pkh + " (" + config.contracts[i].identity + ")"));        
        }
    }
    else{
        console.log(this.helper.outputError("No Contracts are Available !!"));        
    }
}

async _deployContract() {
    var args = process.argv.slice(3);
        if (args.length < 4) {
            console.log(this.helper.outputInfo("Incorrect usage of deploy command \nCorrect usage: - tezster deploy <contract-label> <contract-absolute-path> <init-storage-value> <account>"));
            return;
        }
        await this.loadTezsterConfig(); 
    
        let result = await this.deployContract(args[0], args[1], args[2], args[3]);
        console.log(result);
        console.log(this.helper.outputInfo(`If you're using babylonnet node, use https://babylonnet.tzstats.com to check contract/transactions`));
}


async _callContract() {
    var args = process.argv.slice(3);
    if (args.length < 3) {
        console.log(this.helper.outputInfo("Incorrect usage of call command \nCorrect usage: - tezster call <contract-name> <argument-value> <account>"));
        return;
    }
    await this.loadTezsterConfig(); 
    
    let result = await this.invokeContract(args[0], args[1], args[2]);
    console.log(result);
    console.log(this.helper.outputInfo(`If you're using babylonnet node, use https://babylonnet.tzstats.com to check contract/transactions`));
}

async _getStorage() {
    var args = process.argv.slice(3);
    if (args.length < 1) {
        console.log(this.helper.outputInfo("Incorrect usage of get-storage command \nCorrect usage: - tezster get-storage <contract-name>"));
        return;
    }
    await this.loadTezsterConfig(); 
    
    let result = await this.getStorage(args[0]);
    console.log(result);
}

async _addContract() {
    var args = process.argv.slice(3);  
    if (args.length < 2) return console.log(this.helper.outputError("Incorrect usage - tezster add-contract <label> <Address>"));
    await this.loadTezsterConfig();
    console.log(this.addContract(args[0], args[1], ''));      
}

async deployContract(contractLabel, contractPath, initValue, account) {
    const fs = require("fs");
    const conseiljs = require(ConseilJS);
    const tezosNode = config.provider;  
    
    const keys = this.getKeys(account);
    if(!keys) {
      return this.helper.outputError(`Couldn't find keys for given account.
        Please make sure the account exists and added to tezster. Run 'tezster list-accounts to get all accounts`);
    }
    const keystore = {
        publicKey: keys.pk,
        privateKey: keys.sk,
        publicKeyHash: keys.pkh,
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
  
    let contractObj = this.helper.findKeyObj(config.contracts, contractLabel);
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
              this.addContract(contractLabel, opHash , keys.pkh);
              return this.helper.output(`contract ${contractLabel} has been deployed at ${opHash}`);
  
          case 'failed':
          default:
              return this.helper.outputError(`Contract deployment has failed : ${JSON.stringify(result.results.contents[0].metadata.operation_result)}`)
        }
      }
      return this.helper.outputError(`Contract deployment has failed : ${JSON.stringify(result)}`);
    } catch(error) {
      return this.helper.outputError(error);
    }
}

async invokeContract(contract, argument, account) {
    const conseiljs = require(ConseilJS);
    const tezosNode = config.provider;
    const keys = this.getKeys(account);
    if(!keys) {
      return this.helper.outputError(`Couldn't find keys for given account.
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
    let contractObj = this.helper.findKeyObj(config.contracts, contract);
    if (contractObj) {
      contractAddress = contractObj.pkh;
    }
    
    if (!contractAddress) {
      return this.helper.outputError(`couldn't find the contract, please make sure contract label or address is correct!`);
    }
  
    try {
      const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(
                                  tezosNode, keystore, contractAddress, 0, 100000, '', 1000, 100000, undefined, 
                                  argument, conseiljs.TezosParameterFormat.Michelson);
      
      if (result.results) {
        switch(result.results.contents[0].metadata.operation_result.status) {
          case 'applied':
              let opHash = result.operationGroupID.slice(1,result.operationGroupID.length-2);
              this.addTransaction('contract-call', opHash, keys.pkh, contractObj.label, 0);
              return this.helper.output(`Injected operation with hash ${opHash}`);
  
          case 'failed':
          default:
              return this.helper.outputError(`Contract calling has failed : ${JSON.stringify(result.results.contents[0].metadata.operation_result)}`)
        }
      }
      return this.helper.outputError(`Contract calling has failed : ${JSON.stringify(result)}`);
    }
    catch(error) {
      return this.helper.outputError(error);
    }
}

async getStorage(contract) {
    let contractAddress = '';
    let contractObj = this.helper.findKeyObj(config.contracts, contract);
    if (contractObj) {
      contractAddress = contractObj.pkh;
    }
  
    if (!contractAddress) {
      return this.helper.outputError(`couldn't find the contract, please make sure contract label or address is correct!`);
    }
  
    try {
      let storage = await eztz.contract.storage(contractAddress);
      return this.helper.output(JSON.stringify(storage));
    }
    catch(error) {
      return this.helper.outputError(error);
    }
}

addContractToConfig(contractLabel, contractAddr) {
    let contractObj = this.helper.findKeyObj(config.contracts, contractLabel);
    if (contractObj) {
      return this.helper.outputError(`This contract label is already in use. Please use a different one.`);
    }
    this.addContract(contractLabel, contractAddr, '');
}

addContract(label, opHash, pkh) {
    config.contracts.push({
      label : label,
      pkh : opHash,
      identity : pkh,
    });
    jsonfile.writeFile(confFile, config);
}

addTransaction(operation, opHash, from, to, amount) {
    config.transactions.push({
      operation : operation,
      hash : opHash,
      from : from,
      to: to,
      amount: amount
    });
    jsonfile.writeFile(confFile, config);
}

getKeys(account) {
    let keys,f;
    if (f = this.helper.findKeyObj(config.identities, account)) {
        keys = f;
    } else if (f = this.helper.findKeyObj(config.accounts, account)) {
        keys = this.helper.findKeyObj(config.identities, f.identity);
    } else if (f = this.helper.findKeyObj(config.contracts, account)) {
        keys = this.helper.findKeyObj(config.identities, f.identity);
    }
    return keys;
}

async loadTezsterConfig() {
    eztz = require('../../lib/eztz.cli.js').eztz;
    const jsonfile = require('jsonfile');
    config=jsonfile.readFileSync(confFile);
    if (config.provider) {
        eztz.node.setProvider(config.provider);
    }  
    const _sodium = require('libsodium-wrappers');
    await _sodium.ready;
    eztz.library.sodium = _sodium;
}

}

module.exports = { Contracts }
