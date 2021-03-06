const { confFile, CONSEIL_SERVER, NODE_TYPE, TZSTATS_NODE_TYPE } = require('../cli-constants');

const conseiljs = require('conseiljs'),
      conseiljssoftsigner = require('conseiljs-softsigner'),
      fetch = require('node-fetch'),
      log = require('loglevel'),
      logger = log.getLogger('conseiljs'),
      
      jsonfile = require('jsonfile'),
      writeJsonFile = require('write-json-file'),
      Logger = require('../logger'),
      { Helper } = require('../helper'),
      { ExceptionHandler } = require('../exceptionHandler');

class Contracts {

    constructor(){
        this.config = jsonfile.readFileSync(confFile);
    }

    async listContracts() {
        Logger.verbose('Command : tezster list-contracts');
        if(Object.keys(this.config.contracts).length > 0) {  
            this.config.contracts.forEach(function (contracts){
                Logger.info(contracts.label + ' - ' +contracts.pkh + ' (' + contracts.identity + ')');
            });
        } else {
            Logger.error('No Contracts are Available !!');
        }
    }

    async deployContract(contractLabel, contractAbsolutePath, initStorageValue, account, amount, fee, storageLimit, gasLimit) {
        Logger.verbose(`Command : tezster deploy ${contractLabel}, ${contractAbsolutePath}, ${initStorageValue}, ${account}, ${amount}, ${fee}, ${storageLimit}, ${gasLimit}}`);
    
        if (!account) {
            Logger.warn('Incorrect usage - tezster deploy <contract-label> <contract-file-path> <initial-storage> <account> <--optional amount>\nTo use interactive mode - tezster deploy -i');
            return;
        }
        await this.deploy(contractLabel, contractAbsolutePath, initStorageValue, account, amount, fee, storageLimit, gasLimit);
        Logger.warn(`If you're using '${NODE_TYPE.TESTNET}' or 'mainnet' node, use 'https://${TZSTATS_NODE_TYPE.TESTNET}.tzstats.com' or 'https://tzstats.com' respectively to check contract/transactions`);
    }

    async callContract(contractLabel, contractArgs, account, amount, fee, storageLimit, gasLimit) {
        Logger.verbose(`Command : tezster call ${contractLabel}, ${contractArgs}, ${account}, ${amount}, ${fee}, ${storageLimit}, ${gasLimit}}`);

        if (!account) {
            Logger.warn('Incorrect usage - tezster call <contract-label> <argument-value> <account> <--optional amount>\nTo use interactive mode - tezster call -i');
            return;
        }
        await this.invokeContract(contractLabel, contractArgs, account, amount, fee, storageLimit, gasLimit);
        Logger.warn(`If you're using '${NODE_TYPE.TESTNET}' or 'mainnet' node, use 'https://${TZSTATS_NODE_TYPE.TESTNET}.tzstats.com' or 'https://tzstats.com' respectively to check contract/transactions`);
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

    async listEntryPoints(contract) {
        conseiljs.registerLogger(logger);
        conseiljs.registerFetch(fetch);

        const tezosNode = this.config.provider;  
        const fs = require('fs');
        let Network_type = 'TESTNET';

        if(Helper.isMainnetNode(tezosNode)) {
            Network_type = 'MAINNET';
        } else if(Helper.isEdoNode(tezosNode)) {
            Network_type = 'EDONET';
        }

        let conseilServer = { 'url': `${CONSEIL_SERVER[Network_type].url}`, 'apiKey': `${CONSEIL_SERVER[Network_type].apiKey}`, 'network': `${NODE_TYPE[Network_type]}` };

        let contractCode, contractAddress, contractPath;
        let contractObj = Helper.findKeyObj(this.config.contracts, contract);
        if (contractObj) {
            contractAddress = contractObj.pkh;
        }

        if(contract.startsWith('KT')) {
            contractAddress = contract;
        } else {
            contractPath = contract;
        }
      
        if (!contractAddress && !fs.existsSync(contractPath)) {
            Logger.error(`Please check if contract exists at '${contractPath}' or contract address is correct.`);
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
        conseiljs.registerLogger(logger);
        conseiljs.registerFetch(fetch);

        const fs = require('fs');
        const tezosNode = this.config.provider;  

        const keys = this.getKeys(account);
        if(!keys) {
            Logger.error(`Couldn't find keys for given account.\nPlease make sure the account '${account}' exists and added to tezster. Run 'tezster list-accounts' to get all accounts.`);
            return;
        }
        const decryptedSecretKey = account.match(/bootstrap.*[1-5]$/gm) ? keys.sk : Helper.decrypt(keys.sk);

        const keystore = {
            publicKey: keys.pk,
            privateKey: decryptedSecretKey,
            publicKeyHash: keys.pkh,
            seed: '',
            storeType: conseiljs.KeyStoreType.Fundraiser
        };
      
        let contractObj = Helper.findKeyObj(this.config.contracts, contractLabel);
        if (contractObj) {
            Logger.error(`This contract label is already in use. Please use a different one.`);
            return;
        }

        amount = amount ? amount : 0;
        fee = fee ? fee : 100000;
        storageLimit = storageLimit ? storageLimit : 10000;
        gasLimit = gasLimit ? gasLimit : 500000;
      
        Logger.warn('Deploying the contract, this could take a while....');
        try {
            const contract = fs.readFileSync(contractPath, 'utf8');
            const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keystore.privateKey,'edsk'), -1);

            const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
                                      tezosNode, signer, keystore, amount*1000000, undefined,
                                      fee, storageLimit, gasLimit,
                                      contract, initValue, conseiljs.TezosParameterFormat.Michelson, -1);      
            
            if (result.results) {
                switch(result.results.contents[0].metadata.operation_result.status) {
                    case 'applied':
                        let opHash = result.results.contents[0].metadata.operation_result.originated_contracts;
                        this.addNewContract(contractLabel, opHash[0] , keys.pkh , this.config.provider);
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
        conseiljs.registerLogger(logger);
        conseiljs.registerFetch(fetch);
        
        const tezosNode = this.config.provider;
        const keys = this.getKeys(account);

        if(!keys) {
            Logger.error(`Couldn't find keys for given account.\nPlease make sure the account '${account}' exists and added to tezster. Run 'tezster list-accounts' to get all accounts.`);
            return;
        }
        const decryptedSecretKey = account.match(/bootstrap.*[1-5]$/gm) ? keys.sk : Helper.decrypt(keys.sk);

        const keystore = {
            publicKey: keys.pk,
            privateKey: decryptedSecretKey,
            publicKeyHash: keys.pkh,
            seed: '',
            storeType: conseiljs.KeyStoreType.Fundraiser
        };
      
        let contractAddress = '';
        let contractObj = Helper.findKeyObj(this.config.contracts, contract);
        if (contractObj) {
          contractAddress = contractObj.pkh;
        }
        
        if (!contractAddress) {
          Logger.error(`Couldn't find the contract, please check if contract address/label '${contract}' is correct.`);
          return;
        }

        amount = amount ? amount : 0;
        fee = fee ? fee : 100000;
        storageLimit = storageLimit ? storageLimit : 10000;
        gasLimit = gasLimit ? gasLimit : 500000;
      
        try {
          const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keystore.privateKey,'edsk'), -1);

          const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(
                                      tezosNode, signer, keystore, contractAddress, amount*1000000, fee, storageLimit, gasLimit, undefined, 
                                      argument, conseiljs.TezosParameterFormat.Michelson, -1);
          
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
        conseiljs.registerLogger(logger);
        conseiljs.registerFetch(fetch);
        
        const tezosNode = this.config.provider;
        let contractAddress = '';

        let contractObj = Helper.findKeyObj(this.config.contracts, contract);
        if (contractObj) {
            contractAddress = contractObj.pkh;
        }
      
        if (!contractAddress) {
            Logger.error(`Couldn't find the contract, please check if contract address/label '${contract}' is correct.`);
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
        let contractObj = Helper.findKeyObj(this.config.contracts, contractLabel);

        if(this.config.provider.includes('localhost')) {
            Logger.error(`Contract can't be added for localnodes. Please select relevant rpc node to add contract.`);
            return;
        }
        
        if (contractObj) {
            Logger.error('This contract label is already in use. Please use a different one.');
            return;
        }
        this.addNewContract(contractLabel, contractAddr, '', this.config.provider);
        Logger.info(`Contract '${contractAddr} has been added successfully with label '${contractLabel}'`)
    }

    async deleteContract(contract) {
        let contractObj = Helper.findKeyObj(this.config.contracts, contract);
        if (!contractObj) {
            Logger.error(`Please make sure the contract with label '${contract}' exists.`);
            return;
        }

        try {
            for(var contractIndex=0; contractIndex<this.config.contracts.length; contractIndex++) {
                if(this.config.contracts[contractIndex].pkh === contract  || this.config.contracts[contractIndex].label === contract) {
                    Logger.info(`Contract-'${contract}' successfully removed`);
                    this.config.contracts.splice(contractIndex, 1);
                    await writeJsonFile(confFile, this.config);
                }
            }
        }
        catch(error) {
            Logger.error(`Error occurred while removing contract : ${error}`);
        }
    }

    async addNewContract(label, opHash, pkh, nodeType) {
        if(nodeType.includes(NODE_TYPE.LOCALHOST) || nodeType.includes(NODE_TYPE.WIN_LOCALHOST)) {
            nodeType = NODE_TYPE.LOCALHOST;
        } else if(nodeType.includes(NODE_TYPE.MAINNET)) {
            nodeType = NODE_TYPE.MAINNET;
        } else if(nodeType.includes(NODE_TYPE.EDONET)) {
            nodeType = NODE_TYPE.EDONET;
        } else {
            nodeType = `${NODE_TYPE.TESTNET}`;
        }
        this.config.contracts.push({
            label : label,
            pkh : opHash,
            identity : `${nodeType} - ` + pkh,
        });
        await writeJsonFile(confFile, this.config);
    }

    async addTransaction(operation, opHash, from, to, amount) {
        this.config.transactions.push({
            operation : operation,
            hash : opHash,
            from : from,
            to: to,
            amount: amount
        });
        await writeJsonFile(confFile, this.config);
    }

    getKeys(account) {
        let keys,f;
        if (f = Helper.findKeyObj(this.config.identities, account)) {
            keys = f;
        } else if (f = Helper.findKeyObj(this.config.accounts, account)) {
            keys = Helper.findKeyObj(this.config.identities, f.identity);
        } else if (f = Helper.findKeyObj(this.config.contracts, account)) {
            keys = Helper.findKeyObj(this.config.identities, f.identity);
        }
        return keys;
    }

}

module.exports = { Contracts }