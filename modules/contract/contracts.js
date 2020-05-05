const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var config = jsonfile.readFileSync(confFile);
const CONSEIL_JS = '../../lib/conseiljs';
const TESTNET_NAME = 'carthagenet';

const Logger = require('../logger');
const { Helper } = require('../helper');

class Contracts {

    async listContracts() {
        Logger.verbose('Command : tezster list-contracts');
        if(Object.keys(config.contracts).length > 0) {        
            for(var i in config.contracts) { 
                Logger.info(config.contracts[i].label + ' - ' + config.contracts[i].pkh + ' (' + config.contracts[i].identity + ')');
            }
        } else {
            Logger.error('No Contracts are Available !!');
        }
    }

    async deployContract(args) {
        Logger.verbose(`Command : tezster deploy ${args}`);
        if (args.length < 4) {
            Logger.warn('Incorrect usage of deploy command \nCorrect usage: - tezster deploy <contract-label> <contract-absolute-path> <init-storage-value> <account> [options]');
            return;
        }
    
        await this.deploy(args[0], args[1], args[2], args[3], args[5]);
        Logger.warn(`If you're using ${TESTNET_NAME} node, use https://${TESTNET_NAME}.tzstats.com to check contract/transactions`);
    }

    async callContract(args) {
        Logger.verbose(`Command : tezster call ${args}`);
        if (args.length < 3) {
            Logger.warn('Incorrect usage of call command \nCorrect usage: - tezster call <contract-name> <argument-value> <account> [options]');
            return;
        }
        
        await this.invokeContract(args[0], args[1], args[2], args[4]);
        Logger.warn(`If you're using ${TESTNET_NAME} node, use https://${TESTNET_NAME}.tzstats.com to check contract/transactions`);
    }

    async getStorage(args) {
        Logger.verbose(`Command : tezster get-storage ${args}`);
        if (args.length < 1) {
            Logger.warn('Incorrect usage of get-storage command \nCorrect usage: - tezster get-storage <contract-name>');
            return;
        }
        
        await this.getContractStorage(args[0]);
    }

    async addContract(args) {
        Logger.verbose(`Command : tezster add-contract ${args}`);
        if (args.length < 2) {
            Logger.warn('Incorrect usage - tezster add-contract <label> <Address>');
            return;
        }
        this.addContractToConfig(args[0], args[1], '');
    }

    async getEntryPoints(args) {
        Logger.verbose(`Command : tezster list-entry-points ${args}`);
        if (args.length < 1) {
            Logger.warn('Incorrect usage - tezster list-entry-points <contract-absolute-path>');
            return;
        }
        this.listEntryPoints(args[0]);
    }

    async removeContract(args) {
        Logger.verbose(`Command : tezster remove-contract ${args}`);
        if (args.length < 1) {
            Logger.warn(`Incorrect usage of remove-contract command \nCorrect usage: - tezster remove-contract <contract-label>`);
            return;
        }
        await this.deleteContract(args[0]);
    }

    async listEntryPoints(contractPath) {
        const fs = require('fs');
        const conseiljs = require(CONSEIL_JS);

        try {
            const contractCode = fs.readFileSync(contractPath, 'utf8');
            const entryPoints = await conseiljs.TezosContractIntrospector.generateEntryPointsFromCode(contractCode);
            const storageFormat = await conseiljs.TezosLanguageUtil.preProcessMichelsonScript(contractCode);
            Logger.info(`\nInitial Storage input must be of type : ${storageFormat[1].slice(8)}`);
            entryPoints.forEach(p => {
                Logger.info('-------------------------------------------------------------------------------------------------------------------------------------');
                Logger.info(`\nName => ${p.name}\n\nParameters => (${p.parameters.map(pp => (pp.name || '') + pp.type).join(', ')})\n\nStructure => ${p.structure}\n\nExample => ${p.generateSampleInvocation()}\n`);
            });
        }
        catch(error) {
            Logger.error(`Error occured while fetching entry points:\n${error}`);
        }
    }

    async deploy(contractLabel, contractPath, initValue, account, amount) {
        const fs = require('fs');
        const conseiljs = require(CONSEIL_JS);
        const tezosNode = config.provider;  

        const keys = this.getKeys(account);
        if(!keys) {
            Logger.error(`Couldn't find keys for given account.\nPlease make sure the account exists and added to tezster. Run 'tezster list-accounts' to get all accounts`);
            return;
        }
        const keystore = {
            publicKey: keys.pk,
            privateKey: keys.sk,
            publicKeyHash: keys.pkh,
            seed: '',
            storeType: conseiljs.StoreType.Fundraiser
        };
      
        let contractObj = Helper.findKeyObj(config.contracts, contractLabel);
        if (contractObj) {
            Logger.error(`This contract label is already in use. Please use a different one.`);
            return;
        }

        amount = amount | 0;
      
        try {
            const contract = fs.readFileSync(contractPath, 'utf8');
            const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
                                      tezosNode, keystore, amount*1000000, undefined,
                                      100000, '', 10000, 500000, 
                                      contract, initValue, conseiljs.TezosParameterFormat.Michelson);         
            if (result.results) {
                switch(result.results.contents[0].metadata.operation_result.status) {
                    case 'applied':
                        let opHash = result.results.contents[0].metadata.operation_result.originated_contracts;
                        this.addNewContract(contractLabel, opHash[0] , keys.pkh , config.provider);
                        Logger.info(`contract '${contractLabel}' has been deployed at ${opHash}`);
                        return;
                    case 'failed':
                    default:
                        Logger.error(`Contract deployment has failed : ${JSON.stringify(result.results.contents[0].metadata.operation_result)}`)
                        return;
              }
            }
            Logger.error(`Contract deployment has failed : ${JSON.stringify(result)}`);
            return;
        } catch(error) {
            if(error.toString().includes('Unexpected word token')) {
                let parseError = `${error}`.indexOf('Instead, ');
                Logger.error(`${error}`.substring(0, parseError != -1  ? parseError : `${error}`.length));
            } else if(error.toString().includes(`empty_implicit_contract`)) {
                Helper.errorLogHandler(`Error occured while deploying the smart contract: ${error}`, `Account is having zero balance or not activated on the current provider.... To list down available accounts run 'tezster list-accounts'`);
            } else if(error.toString().includes(`connect ECONNREFUSED`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Make sure local nodes are in running state....`);
            } else if(error.toString().includes(`Only absolute URLs are supported`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Current provider URL is not supported by network provider....`);
            } else if(error.toString().includes(`getaddrinfo ENOTFOUND`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Current provider URL is not supported by network provider....`);
            } else {
                Logger.error(`Error occured while deploying the smart contract:\n${error}`);
            }
        }
    }

    async invokeContract(contract, argument, account, amount) {
        const conseiljs = require(CONSEIL_JS);
        const tezosNode = config.provider;
        const keys = this.getKeys(account);
        if(!keys) {
            Logger.error(`Couldn't find keys for given account.\nPlease make sure the account exists and added to tezster. Run 'tezster list-accounts' to get all accounts`);
            return;
        }
        const keystore = {
            publicKey: keys.pk,
            privateKey: keys.sk,
            publicKeyHash: keys.pkh,
            seed: '',
            storeType: conseiljs.StoreType.Fundraiser
        };
      
        let contractAddress = '';
        let contractObj = Helper.findKeyObj(config.contracts, contract);
        if (contractObj) {
          contractAddress = contractObj.pkh;
        }
        
        if (!contractAddress) {
          Logger.error(`Couldn't find the contract, please make sure contract label or address is correct!`);
          return;
        }

        amount = amount | 0;
      
        try {
          const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(
                                      tezosNode, keystore, contractAddress, amount*1000000, 100000, '', 10000, 100000, undefined, 
                                      argument, conseiljs.TezosParameterFormat.Michelson);
          
          if (result.results) {
            switch(result.results.contents[0].metadata.operation_result.status) {
              case 'applied':
                  let opHash = result.operationGroupID.slice(1,result.operationGroupID.length-2);
                  this.addTransaction('contract-call', opHash, keys.pkh, contractObj.label, 0);
                  Logger.info(`Injected operation with hash ${opHash}`);
                  return;
      
              case 'failed':
              default:
                  Logger.error(`Contract calling has failed : ${JSON.stringify(result.results.contents[0].metadata.operation_result)}`)
                  return;
            }
          }
          Logger.error(`Contract calling has failed : ${JSON.stringify(result)}`);
          return;
        }
        catch(error) {
            if(error.toString().includes('Unexpected word token')) {
                let parseError = `${error}`.indexOf('Instead, ');
                Logger.error(`${error}`.substring(0, parseError != -1  ? parseError : `${error}`.length));
            } else if(error.toString().includes(`empty_implicit_contract`)) {
                Helper.errorLogHandler(`Error occured while calling the contract: ${error}`, `Account is having zero balance or not activated on the current provider.... To list down available accounts run 'tezster list-accounts'.`);
            } else if(error.toString().includes(`empty_transaction`)) {
                Helper.errorLogHandler(`Error occured while calling the contract: ${error}`, `please wait.... contract '${contractAddress}' might take some time to get deployed on the tezos network`);;
            } else if(error.toString().includes(`connect ECONNREFUSED`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Make sure local nodes are in running state....`);
            } else if(error.toString().includes(`Only absolute URLs are supported`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Current provider URL is not supported by network provider....`);
            } else if(error.toString().includes(`getaddrinfo ENOTFOUND`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Current provider URL is not supported by network provider....`);
            } else {
                Logger.error(`Error occured while calling the contract:\n${error}`);
            }
        }
    }

    async getContractStorage(contract) {
        const conseiljs = require(CONSEIL_JS);
        const tezosNode = config.provider;
        let contractAddress = '';
        let contractObj = Helper.findKeyObj(config.contracts, contract);
        if (contractObj) {
            contractAddress = contractObj.pkh;
        }
      
        if (!contractAddress) {
            Logger.error(`Couldn't find the contract, please make sure contract label or address is correct!`);
            return;
        }
      
        try {
            let storage = await conseiljs.TezosNodeReader.getContractStorage(tezosNode, contractAddress);
            Logger.info(JSON.stringify(storage));
        }
        catch(error) {
            if(error.toString().includes('with 404 and Not Found')) {
                Helper.errorLogHandler(`Error occured while fetching contract storage value ${error}`, `please wait.... contract '${contractAddress}' might take some time to get deployed on the tezos network`);
            } else if(error.toString().includes(`connect ECONNREFUSED`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Make sure local nodes are in running state....`);
            } else if(error.toString().includes(`Only absolute URLs are supported`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Current provider URL is not supported by network provider....`);
            } else if(error.toString().includes(`getaddrinfo ENOTFOUND`)) {
                Helper.errorLogHandler(`Error occured while fetching balance: ${error}`, `Current provider URL is not supported by network provider....`);
            } else {
                Helper.errorLogHandler(`Error occured while fetching contract storage value ${error}`, `Error occured while fetching contract-'${contractAddress}' storage`);
            }
        }
    }

    addContractToConfig(contractLabel, contractAddr) {
        let contractObj = Helper.findKeyObj(config.contracts, contractLabel);
        if (contractObj) {
            Logger.error('This contract label is already in use. Please use a different one.');
            return;
        }
        this.addNewContract(contractLabel, contractAddr, '', config.provider);
    }

    async deleteContract(contract) {
        let contractObj = Helper.findKeyObj(config.contracts, contract);
        if (!contractObj) {
            Logger.error(`Please make sure the contract with label '${contract}' exists.`);
            return;
        }

        try {
            for(var i=0;i<config.contracts.length;i++) {
                if(config.contracts[i].pkh === contract  || config.contracts[i].label === contract) {
                    Logger.info(`Contract-'${contract}' successfully removed`);
                    config.contracts.splice(i, 1);
                    jsonfile.writeFile(confFile, config);
                }
            }
        }
        catch(error) {
            Logger.error(`Error occured while removing contract : ${error}`);
        }
    }

    addNewContract(label, opHash, pkh, nodeType) {
        if(nodeType.includes('localhost')) {
            nodeType = 'localnode';
        } else {
            nodeType = 'carthagenet'
        }
        config.contracts.push({
            label : label,
            pkh : opHash,
            identity : `${nodeType} - ` + pkh,
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
        if (f = Helper.findKeyObj(config.identities, account)) {
            keys = f;
        } else if (f = Helper.findKeyObj(config.accounts, account)) {
            keys = Helper.findKeyObj(config.identities, f.identity);
        } else if (f = Helper.findKeyObj(config.contracts, account)) {
            keys = Helper.findKeyObj(config.identities, f.identity);
        }
        return keys;
    }

}

module.exports = { Contracts }