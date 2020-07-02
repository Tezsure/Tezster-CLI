const { confFile, CONSEIL_JS, TESTNET_NAME, CONSEIL_SERVER_APIKEY, CONSEIL_SERVER_URL, TEZSTER_FOLDER_PATH } = require('../cli-constants');
      
const jsonfile = require('jsonfile'),
      Logger = require('../logger'),
      { Helper } = require('../helper'),
      { ExceptionHandler } = require('../exceptionHandler');

let config;
      
class Contracts {

    constructor(){
        config = jsonfile.readFileSync(confFile);
    }

    async listContracts() {
        Logger.verbose('Command : tezster list-contracts');
        if(Object.keys(config.contracts).length > 0) {  
            config.contracts.forEach(function (contracts){
                Logger.info(contracts.label + ' - ' +contracts.pkh + ' (' + contracts.identity + ')');
            });
        } else {
            Logger.error('No Contracts are Available !!');
        }
    }

    async deployContract(args) {
        Logger.verbose(`Command : tezster deploy ${args}`);
    
        await this.deploy(args.contractLabel, args.contractAbsolutePath, args.initStorageValue, args.account, args.amount, args.fee, args.storageLimit, args.gasLimit);
        Logger.warn(`If you're using ${TESTNET_NAME} node, use https://${TESTNET_NAME}.tzstats.com to check contract/transactions`);
    }

    async callContract(args) {
        Logger.verbose(`Command : tezster call ${args}`);
        
        await this.invokeContract(args.contractName, args.argumentValue, args.account, args.amount, args.fee, args.storageLimit, args.gasLimit);
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
            Logger.warn('Incorrect usage - tezster list-entry-points <contract-absolute-path/contract-address>');
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
        let conseilServer = { 'url': CONSEIL_SERVER_URL, 'apiKey': CONSEIL_SERVER_APIKEY, 'network': TESTNET_NAME };
        let contractCode, contractAddress;
        let contractObj = Helper.findKeyObj(config.contracts, contractPath);
        if (contractObj) {
            contractAddress = contractObj.pkh;
        }
      
        if (!contractAddress && !fs.existsSync(contractPath)) {
            Logger.error(`Couldn't find the contract, please make sure contract label or address is correct!`);
            return;
        }

        try {
            if(contractAddress) {
                const account = await conseiljs.TezosConseilClient.getAccount(conseilServer, conseilServer.network, contractAddress);
                contractCode = account.script;
            } else {
                contractCode = fs.readFileSync(contractPath, 'utf8');
            }

            const entryPoints = await conseiljs.TezosContractIntrospector.generateEntryPointsFromCode(contractCode);
            const storageFormat = await conseiljs.TezosLanguageUtil.preProcessMichelsonScript(contractCode);
            Logger.info(`\nInitial Storage input must be of type : ${storageFormat[1].slice(8)}`);
            entryPoints.forEach(p => {
                Logger.info('-------------------------------------------------------------------------------------------------------------------------------------');
                Logger.info(`\nName => ${p.name}\n\nParameters => (${p.parameters.map(pp => (pp.name || '') + pp.type).join(', ')})\n\nStructure => ${p.structure}\n`);
            });
        }
        catch(error) {
            Logger.error(`Error occurred while fetching entry points:\n${error}`);
        }
    }

    async deploy(contractLabel, contractPath, initValue, account, amount, fee, storageLimit, gasLimit) {
        const fs = require('fs');
        const conseiljs = require(CONSEIL_JS);
        const tezosNode = config.provider;  
        let conseilServer = { 'url': CONSEIL_SERVER_URL, 'apiKey': CONSEIL_SERVER_APIKEY, 'network': TESTNET_NAME };

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
        fee = fee | 100000;
        storageLimit = storageLimit | 10000;
        gasLimit = gasLimit | 500000;
      
        Logger.warn('Deploying the contract, this could take a while....');
        try {
            const contract = fs.readFileSync(contractPath, 'utf8');
            const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
                                      tezosNode, keystore, amount*1000000, undefined,
                                      fee, '', storageLimit, gasLimit,
                                      contract, initValue, conseiljs.TezosParameterFormat.Michelson);        
                                      
            if(!tezosNode.includes('localhost') && !tezosNode.includes('192.168')) {
                try {
                    await conseiljs.TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, JSON.parse(result.operationGroupID), 15, 10);
                } catch(error) {
                    Helper.errorLogHandler(`Error occurred in operation confirmation: ${error}`,
                                           'Contract deployment operation confirmation failed ....');
                }
            }
            
            if (result.results) {
                switch(result.results.contents[0].metadata.operation_result.status) {
                    case 'applied':
                        let opHash = result.results.contents[0].metadata.operation_result.originated_contracts;
                        this.addNewContract(contractLabel, opHash[0] , keys.pkh , config.provider);
                        Logger.info(`Contract '${contractLabel}' has been deployed with ${opHash}`);
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
            ExceptionHandler.contractException('deploy', error);
        }
    }

    async invokeContract(contract, argument, account, amount, fee, storageLimit, gasLimit) {
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
        fee = fee | 100000;
        storageLimit = storageLimit | 10000;
        gasLimit = gasLimit | 100000;
      
        try {
          const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(
                                      tezosNode, keystore, contractAddress, amount*1000000, fee, '', storageLimit, gasLimit, undefined, 
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
            ExceptionHandler.contractException('invoke', error);
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
            ExceptionHandler.contractException('getStorage', error);
        }
    }

    addContractToConfig(contractLabel, contractAddr) {
        let contractObj = Helper.findKeyObj(config.contracts, contractLabel);
        if (contractObj) {
            Logger.error('This contract label is already in use. Please use a different one.');
            return;
        }
        this.addNewContract(contractLabel, contractAddr, '', config.provider);
        Logger.info(`Contract '${contractAddr} has been added successfully with label '${contractLabel}'`)
    }

    async deleteContract(contract) {
        let contractObj = Helper.findKeyObj(config.contracts, contract);
        if (!contractObj) {
            Logger.error(`Please make sure the contract with label '${contract}' exists.`);
            return;
        }

        try {
            for(var contractIndex=0; contractIndex<config.contracts.length; contractIndex++) {
                if(config.contracts[contractIndex].pkh === contract  || config.contracts[contractIndex].label === contract) {
                    Logger.info(`Contract-'${contract}' successfully removed`);
                    config.contracts.splice(contractIndex, 1);
                    jsonfile.writeFile(confFile, config);
                }
            }
        }
        catch(error) {
            Logger.error(`Error occurred while removing contract : ${error}`);
        }
    }

    addNewContract(label, opHash, pkh, nodeType) {
        if(nodeType.includes('localhost') || nodeType.includes('192.168')) {
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