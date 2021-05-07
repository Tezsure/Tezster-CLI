const { confFile, NODE_TYPE, TZSTATS_NODE_TYPE, CONSEIL_SERVER } = require('../cli-constants');

const conseiljs = require('conseiljs'),
      conseiljssoftsigner = require('conseiljs-softsigner'),
      fetch = require('node-fetch'),
      log = require('loglevel'),
      logger = log.getLogger('conseiljs'),
      
      jsonfile = require('jsonfile'),
      writeJsonFile = require('write-json-file'),
      Logger = require('../logger'),
      { Helper } = require('../helper'),
      { RpcRequest } = require('../rpc-util'),
      docker_machine_ip = require('docker-ip'),
      { ExceptionHandler } = require('../exceptionHandler'),
      crypto = require('crypto'),
      IV = crypto.randomBytes(16);

class Accounts{

    constructor(){
        this.config = jsonfile.readFileSync(confFile);

        if(this.config.EncryptionIv == ""){
            this.config.EncryptionIv = IV;
            writeJsonFile(confFile, this.config);
        }
    }

    async setProvider(args){
        Logger.verbose(`Command : tezster set-rpc-node ${args}`);
        let providerToSet = args.newCustomNodeProvider ? args.newCustomNodeProvider : args.newNodeProvider;
        this.setProviderAccounts(providerToSet);
    }

    async getProvider() {
        Logger.verbose(`Command : tezster get-rpc-node`);
        this.getProviderAccounts();
    }

    async getBalance(args) {
        Logger.verbose(`Command : tezster get-balance ${args}`);
        if (args.length < 1) {
            Logger.warn('Incorrect usage of get-balance command \nCorrect usage: - tezster get-balance <account/contract>');
            return;
        }
        this.getBalanceAccounts(args[0]);
    }

    async listAccounts() {  
        Logger.verbose(`Command : tezster list-accounts`);
        if(Object.keys(this.config.accounts).length > 0) {
            this.config.accounts.forEach(function (accounts){
                Logger.info(accounts.label + ' - ' +accounts.pkh + ' (' + accounts.identity + ')');
            });
        } else {    
            Logger.error('No Account is available !!');
        }
    }

    async createWallet(args) {   
        Logger.verbose(`Command : tezster create-wallet ${args}`);
        if (args.length < 1) {
            Logger.warn('Incorrect usage - tezster create-wallet <wallet-label>');
            return;
        }
        this.createTestnetWallet(args);
    }

    async addTestnetAccount(args) {  
        Logger.verbose(`Command : tezster add-testnet-account ${args}`);
        if (args.length < 2) {
            Logger.warn('Incorrect usage of add-testnet-account command \nCorrect usage: - tezster add-testnet-account <account-label> <absolut-path-to-json-file>');
            return;
        }
        this.addFaucetAccount(args[0], args[1]);
    }

    async restoreWalletUsingMnemonic(label, mnemonic) {  
        Logger.verbose(`Command : tezster restore-wallet ${label} ${mnemonic}`);
        this.restoreExistingWalletUsingMnemonic(label, mnemonic);
    }

    async restoreWalletUsingSecret(label, secret) {  
        Logger.verbose(`Command : tezster restore-wallet ${label} ${secret}`);
        this.restoreExistingWalletUsingSecret(label, secret);
    }

    async activateTestnetAccount(args) {  
        Logger.verbose(`Command : tezster activate-testnet-account ${args}`);
        if (args.length < 1) {
            Logger.warn(`Incorrect usage of activate-testnet-account command \nCorrect usage: - tezster activate-testnet-account <account-label>`);
            return;
        }
        
        await this.activateAlphanetAccount(args[0]);
        Logger.warn(`If this account has already been activated, it may throw 'invalid_activation' error. You can visit 'https://${TZSTATS_NODE_TYPE.TESTNET}.tzstats.com' or 'https://tzstats.com' accordingly for more information on this account`);
    }

    async removeAccount(args) {
        Logger.verbose(`Command : tezster remove-account ${args}`);
        if (args.length < 1) {
            Logger.warn(`Incorrect usage of remove-account command \nCorrect usage: - tezster remove-account <account-label/identity/hash>`);
            return;
        }
        await this.deleteAccount(args[0]);
    }

    async setProviderAccounts(new_provider){    
        this.config.provider = new_provider;

        if(Helper.isWindows() && this.config.provider.includes('localhost')) {
            let current_docker_machine_ip;
            try { 
                current_docker_machine_ip = docker_machine_ip();
            } catch(error) {
                Helper.errorLogHandler(`Error occurred while fetching docker machine ip address: ${error}`, 'Make sure docker-machine is in running state....');
            }
            this.config.provider = this.config.provider.replace('localhost', current_docker_machine_ip);
        }

        await writeJsonFile(confFile, this.config);
        Logger.info('Active RPC node updated to ' + this.config.provider);

        if(new_provider.includes('main')){
            Logger.warn(`Caution: We are storing your private keys in encryped form on your system at "/var/tmp/tezster/config.json"`);
        }
    }

    getProviderAccounts(){    
        if (this.config.provider) {
            Logger.info(this.config.provider);
        } else {
            Logger.warn('No rpc node is set');
        } 
    }

    async getBalanceAccounts(account) {
        let pkh = account, f;
        const tezosNode = this.config.provider;
        if (f = Helper.findKeyObj(this.config.identities, pkh)) {
            pkh = f.pkh;
        } else if (f = Helper.findKeyObj(this.config.accounts, pkh)) {
            pkh = f.pkh;
        } else if (f = Helper.findKeyObj(this.config.contracts, pkh)) {
            pkh = f.pkh;
        } else {
            pkh = account;
        }

        const keys = this.getKeys(account);
        const contractObj = Helper.findKeyObj(this.config.contracts, account);

        if(!keys && !contractObj.label && !contractObj.pkh && !pkh.includes('tz1')) {
            Logger.error(`Account with label '${account}' doesn't exists.`);
            return;
        }

        try {
            const balance = await RpcRequest.fetchBalance(tezosNode, pkh);
            Logger.info(Helper.formatTez(balance));  
        } catch(error) {
            ExceptionHandler.transactionException('getBalance', error);
        }
    }

    async createTestnetWallet(args) {
        const accountLabel = args[0];

        const keys = this.getKeys(accountLabel);
        if(keys) {
            Logger.error(`Account with this label already exists.`);
            return;
        }

        try {
            const mnemonic = conseiljssoftsigner.KeyStoreUtils.generateMnemonic();
            const keystore = await conseiljssoftsigner.KeyStoreUtils.restoreIdentityFromMnemonic(mnemonic, "");

            const encyptedSecretKey = Helper.encrypt(keystore.secretKey);
            this.addIdentity(accountLabel, encyptedSecretKey, keystore.publicKey, keystore.publicKeyHash, '');
            this.addAccount(accountLabel, keystore.publicKeyHash, accountLabel, this.config.provider);     

            Logger.info(`Successfully created wallet with label: '${accountLabel}' and public key hash: '${keystore.publicKeyHash}'`);
            Logger.warn(`We suggest you to store following Mnemonic Pharase which can be used to restore wallet in case you lost wallet:\n'${mnemonic}'`);
        } catch(error) {
            Logger.error(`Error occurred while creating the wallet:\n${error}`);
        }
    }

    async restoreExistingWalletUsingMnemonic(accountLabel, mnemonic) {
        const keys = this.getKeys(accountLabel);
        if(keys) {
            Logger.error(`Account with this label already exists.`);
            return;
        }

        try {
            const keystore = await conseiljssoftsigner.KeyStoreUtils.restoreIdentityFromMnemonic(mnemonic, '');
            const encyptedSecretKey = Helper.encrypt(keystore.secretKey);

            this.addIdentity(accountLabel, encyptedSecretKey, keystore.publicKey, keystore.publicKeyHash, '');
            this.addAccount(accountLabel, keystore.publicKeyHash, accountLabel, this.config.provider);     
            Logger.info(`Successfully restored the wallet with label: '${accountLabel}' and public key hash: '${keystore.publicKeyHash}'`);
        } catch(error) {
            Logger.error(`Error occurred while restoring the wallet:\n${error}`);
        }
    }

    async restoreExistingWalletUsingSecret(accountLabel, secret) {
        const keys = this.getKeys(accountLabel);
        if(keys) {
            Logger.error(`Account with this label already exists.`);
            return;
        }

        try {
            const keystore = await conseiljssoftsigner.KeyStoreUtils.restoreIdentityFromSecretKey(secret);
            const encyptedSecretKey = Helper.encrypt(keystore.secretKey);

            this.addIdentity(accountLabel, encyptedSecretKey, keystore.publicKey, keystore.publicKeyHash, '');
            this.addAccount(accountLabel, keystore.publicKeyHash, accountLabel, this.config.provider);     
            Logger.info(`Successfully restored the wallet with label: '${accountLabel}' and public key hash: '${keystore.publicKeyHash}'`);
        } catch(error) {
            Logger.error(`Error occurred while restoring the wallet:\n${error}`);
        }
    }

    async addFaucetAccount(accountLabel, accountFilePath) {
        const fs = require('fs');
        const keys = this.getKeys(accountLabel);
        if(keys) {
            Logger.error(`Account with this label already exists.`);
            return;
        }

        try {
            let accountJSON = fs.readFileSync(accountFilePath, 'utf8');
            accountJSON = accountJSON && JSON.parse(accountJSON);
            if(!accountJSON) {
                Logger.error(`Error occurred while restoring account : empty JSON file`);
                return;
            }
            let mnemonic = accountJSON.mnemonic;
            let email = accountJSON.email;
            let password = accountJSON.password;
            let pkh = accountJSON.pkh;
            if (!mnemonic || !email || !password) {
                Logger.error(`Error occurred while restoring account : invalid JSON file`);
                return;
            }
            mnemonic = mnemonic.join(' ');

            const alphakeys = await conseiljssoftsigner.KeyStoreUtils.restoreIdentityFromFundraiser(mnemonic, email, password, pkh);
            const encyptedSecretKey = Helper.encrypt(alphakeys.secretKey);
            
            this.addIdentity(accountLabel, encyptedSecretKey, alphakeys.publicKey, alphakeys.publicKeyHash, accountJSON.secret);
            this.addAccount(accountLabel, alphakeys.publicKeyHash, accountLabel, this.config.provider);
            Logger.info(`successfully added testnet faucet account: ${accountLabel}-${alphakeys.publicKeyHash}`);
        } catch(error) {
            Logger.error(`Error occurred while adding testnet faucet account:\n${error}`);
        }
    }

    async activateAlphanetAccount(account) {
        conseiljs.registerLogger(logger);
        conseiljs.registerFetch(fetch);

        const tezosNode = this.config.provider;

        let Network_type = 'TESTNET';
        if(Helper.isMainnetNode(tezosNode)) {
            Network_type = 'MAINNET';
        } else if(Helper.isFlorenceNode(tezosNode)) {
            Network_type = 'FLORENCENET';
        }

        let conseilServer = { 'url': `${CONSEIL_SERVER[Network_type].url}`, 'apiKey': `${CONSEIL_SERVER[Network_type].apiKey}`, 'network': `${NODE_TYPE[Network_type]}` };
        const keys = this.getKeys(account);
        if(!keys || !keys.secret) {
            Logger.error(`Couldn't find keys for given account.\nPlease make sure the account '${account}' exists and added to tezster.`);
            return;
        }

        if(Helper.isTestnetNode(tezosNode)) {
            Logger.error(`Make sure your current rpc-node is set to ${NODE_TYPE.TESTNET} node.\nYou can activate the account by sending some tezos to the account.`);
            return;
        }
        const decryptedSecretKey = Helper.decrypt(keys.sk);

        const keystore = {
            publicKey: keys.pk,
            privateKey: decryptedSecretKey,
            publicKeyHash: keys.pkh,
            seed: '',
            storeType: conseiljs.KeyStoreType.Fundraiser
        };

        try {
            Logger.warn('Activating the account, this could take a while....');
            const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keystore.privateKey,'edsk'), -1);

            let activationResult = await conseiljs.TezosNodeWriter.sendIdentityActivationOperation(tezosNode, signer, keystore, keys.secret);
            try {
                await conseiljs.TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, JSON.parse(activationResult.operationGroupID), 15, 10);
            } catch(error) {
                Helper.errorLogHandler(`Error occurred in operation confirmation: ${error}`,
                                       'Account activation operation confirmation failed ....');
            }

            const revealResult = await conseiljs.TezosNodeWriter.sendKeyRevealOperation(tezosNode, signer, keystore);
            Logger.info(`Testnet faucet account successfully activated: ${keys.label} - ${keys.pkh} \nWith tx hash: ${JSON.stringify(revealResult.operationGroupID)}`);
        } catch(error) {
            ExceptionHandler.transactionException('activateAccount', error);
        }
    }

    async deleteAccount(account) {
        const keys = this.getKeys(account);

        if(!keys) {
            Logger.error(`Couldn't find keys for given account.\nPlease make sure the account '${account}' exists and added to tezster. Run 'tezster list-accounts' to get all accounts.`);
            return;
        }

        if(keys.label.match(/bootstrap[1-5]/)) {
            Logger.error(`Bootstrapped accounts can't be deleted.`);
            return;
        }

        try {
            for(var accountIndex=0; accountIndex<this.config.accounts.length; accountIndex++) {
                if(this.config.accounts[accountIndex].identity === account  || this.config.accounts[accountIndex].label === account || this.config.accounts[accountIndex].pkh === account) {
                    Logger.info(`Account-'${account}' successfully removed`);
                    this.config.accounts.splice(accountIndex, 1);
                    this.config.identities.splice(accountIndex, 1);
                    await writeJsonFile(confFile, this.config);
                }
            }
        }
        catch(error) {
            Logger.error(`Error occurred while removing account:\n${error}`);
        }
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

    async addIdentity(label, sk, pk, pkh, secret) {
        this.config.identities.push({
            sk : sk,
            pk: pk,
            pkh : pkh,
            label : label,
            secret: secret || ''
        });
        await writeJsonFile(confFile, this.config);
    }

    async addAccount(label, pkh, identity, nodeType) {
        if(nodeType.includes(NODE_TYPE.LOCALHOST) || nodeType.includes(NODE_TYPE.WIN_LOCALHOST)) {
            nodeType = NODE_TYPE.LOCALHOST;
        } else if(nodeType.includes(NODE_TYPE.MAINNET)) {
            nodeType = NODE_TYPE.MAINNET;
        } else if(nodeType.includes(NODE_TYPE.FLORENCENET)) {
            nodeType = NODE_TYPE.FLORENCENET;
        } else {
            nodeType = `${NODE_TYPE.TESTNET}`;
        }
        this.config.accounts.push({
            label : `${nodeType}_`+label,
            pkh : pkh,
            identity : identity
        });
        await writeJsonFile(confFile, this.config);
    }

}

module.exports = { Accounts }

