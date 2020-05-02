const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var config = jsonfile.readFileSync(confFile);

const CONSEIL_JS = '../../lib/conseiljs',
      TESTNET_NAME = 'carthagenet',
      CONSEIL_SERVER_APIKEY = 'f979f858-1941-4c4b-b231-d40d41df5377',
      CONSEIL_SERVER_URL = 'https://conseil-dev.cryptonomic-infra.tech:443';

const Logger = require('../logger');
const { Helper } = require('../helper');
const { RpcRequest } = require('../rpc-util');

class Accounts{

    async setProvider(args){
        Logger.verbose(`Command : tezster set-provider ${args}`);
        if (args.length < 1){ 
            Logger.warn('Incorrect usage - tezster set-provider http://<ip>:<port>');
            return;
        }
        this.setProviderAccounts(args);
    }

    async getProvider() {
        Logger.verbose(`Command : tezster get-provider`);
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
        if(Object.keys(config.accounts).length > 0) {
            for(var i in config.accounts) {
                Logger.info(config.accounts[i].label + ' - ' + config.accounts[i].pkh + '(' + config.accounts[i].identity + ')');
            }
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

    async restoreWallet(args) {  
        Logger.verbose(`Command : tezster restore-wallet ${args}`);
        if (args.length < 2) {
            Logger.warn(`Incorrect usage of restore-wallet command \nCorrect usage: - tezster restore-wallet <wallet-label> <mnemonic-phrase> \n(Note: Mnemonic phrase must be enclose between '')`);
            return;
        }
        this.restoreExistingWallet(args[0], args[1]);
    }

    async activateTestnetAccount(args) {  
        Logger.verbose(`Command : tezster activate-testnet-account ${args}`);
        if (args.length < 1) {
            Logger.warn(`Incorrect usage of activate-testnet-account command \nCorrect usage: - tezster activate-testnet-account <account-label>`);
            return;
        }
        
        await this.activateAlphanetAccount(args[0]);
        Logger.warn(`If this account has already been activated, it may throw 'invalid_activation' error. You can visit https://${TESTNET_NAME}.tzstats.com for more information on this account`);
    }

    async removeAccount(args) {
        Logger.verbose(`Command : tezster remove-account ${args}`);
        if (args.length < 1) {
            Logger.warn(`Incorrect usage of remove-account command \nCorrect usage: - tezster remove-account <account-label/identity/hash>`);
            return;
        }
        await this.deleteAccount(args[0]);
    }

    setProviderAccounts(args){    
        config.provider = args[0];
        jsonfile.writeFile(confFile, config);
        Logger.info('Provider updated to ' + config.provider);
    }

    getProviderAccounts(){    
        if (config.provider) {
            Logger.info(config.provider);
        } else {
            Logger.warn('No provider is set');
        } 
    }

    async getBalanceAccounts(account) {
        let pkh = account, f;
        const tezosNode = config.provider;
        if (f = Helper.findKeyObj(config.identities, pkh)) {
            pkh = f.pkh;
        } else if (f = Helper.findKeyObj(config.accounts, pkh)) {
            pkh = f.pkh;
        } else if (f = Helper.findKeyObj(config.contracts, pkh)) {
            pkh = f.pkh;
        }

        const keys = this.getKeys(account);
        const contractObj = Helper.findKeyObj(config.contracts, account);

        if(!keys && !contractObj.label && !contractObj.pkh) {
            Logger.error(`Account with label '${account}' doesn't exists.`);
            return;
        }

        try {
            const balance = await RpcRequest.fetchBalance(tezosNode, pkh);
            Logger.info(Helper.formatTez(balance));  
        } catch(error) {
            if(error.toString().includes(`connect ECONNREFUSED`)) {
                Helper.logsCollection(`Error occured while fetching balance: ${error}`, `Make sure nodes are in running state....`);
            } else if(error.toString().includes(`Unexpected end of JSON input`)) {
                Helper.logsCollection(`Error occured while fetching balance: ${error}`, `Make sure account '${account}' is activated on the current provider....`);
            } else {
                Logger.error(`Error occured while fetching balance: ${error}`);
            }
        }
    }

    async createTestnetWallet(args) {
        const accountLabel = args[0];
        const conseiljs = require(CONSEIL_JS);
        const keys = this.getKeys(accountLabel);
        if(keys) {
            Logger.error(`Account with this label already exists.`);
            return;
        }

        try {
            const mnemonic = conseiljs.TezosWalletUtil.generateMnemonic();
            const keystore = await conseiljs.TezosWalletUtil.unlockIdentityWithMnemonic(mnemonic, '');
            this.addIdentity(accountLabel, keystore.privateKey, keystore.publicKey, keystore.publicKeyHash, '');
            this.addAccount(accountLabel, keystore.publicKeyHash, accountLabel, config.provider);     
            jsonfile.writeFile(confFile, config);
            Logger.info(`Successfully created wallet with label: '${accountLabel}' and public key hash: '${keystore.publicKeyHash}'`);
            Logger.warn(`We suggest you to store following Mnemonic Pharase which can be used to restore wallet in case you lost wallet:\n'${mnemonic}'`);
        } catch(error) {
            Logger.error(`Error occured while creating the wallet: ${error}`);
        }
    }

    async restoreExistingWallet(accountLabel, mnemonic) {
        const conseiljs = require(CONSEIL_JS);
        const keys = this.getKeys(accountLabel);
        if(keys) {
            Logger.error(`Account with this label already exists.`);
            return;
        }

        try {
            const keystore = await conseiljs.TezosWalletUtil.unlockIdentityWithMnemonic(mnemonic, '');
            this.addIdentity(accountLabel, keystore.privateKey, keystore.publicKey, keystore.publicKeyHash, '');
            this.addAccount(accountLabel, keystore.publicKeyHash, accountLabel, config.provider);     
            jsonfile.writeFile(confFile, config);
            Logger.info(`Successfully restored the wallet with label: '${accountLabel}' and public key hash: '${keystore.publicKeyHash}'`);
        } catch(error) {
            Logger.error(`Error occured while restoring the wallet: ${error}`);
        }
    }

    async addFaucetAccount(accountLabel, accountFilePath) {
        const fs = require('fs');
        const conseiljs = require(CONSEIL_JS);
        const keys = this.getKeys(accountLabel);
        if(keys) {
            Logger.error(`Account with this label already exists.`);
            return;
        }
        try {
            let accountJSON = fs.readFileSync(accountFilePath, 'utf8');
            accountJSON = accountJSON && JSON.parse(accountJSON);
            if(!accountJSON) {
                Logger.error(`Error occured while restroing account : empty JSON file`);
                return;
            }
            let mnemonic = accountJSON.mnemonic;
            let email = accountJSON.email;
            let password = accountJSON.password;
            let pkh = accountJSON.pkh;
            if (!mnemonic || !email || !password) {
                Logger.error(`Error occured while restroing account : invalid JSON file`);
                return;
            }
            mnemonic = mnemonic.join(' ');

            const alphakeys = await conseiljs.TezosWalletUtil.unlockFundraiserIdentity(mnemonic, email, password, pkh);

            this.addIdentity(accountLabel, alphakeys.privateKey, alphakeys.publicKey, alphakeys.publicKeyHash, accountJSON.secret);
            this.addAccount(accountLabel, alphakeys.publicKeyHash, accountLabel, config.provider);
            Logger.info(`successfully added testnet faucet account: ${accountLabel}-${alphakeys.publicKeyHash}`);
        } catch(error) {
            Logger.error(`Error occured while adding testnet faucet account : ${error}`);
        }
    }

    async activateAlphanetAccount(account) {
        const conseiljs = require(CONSEIL_JS);
        const tezosNode = config.provider;
        let conseilServer = { 'url': CONSEIL_SERVER_URL, 'apiKey': CONSEIL_SERVER_APIKEY, 'network': TESTNET_NAME };
        const keys = this.getKeys(account);

        if(Helper.confirmNodeProvider(tezosNode)) {
            Logger.error('Make sure your current provider is set to remote node provider.');
            return;
        }

        if(!keys || !keys.secret) {
            Logger.error(`Couldn't find keys for given account.\nPlease make sure the account exists and added to tezster.`);
            return;
        }
        const keystore = {
            publicKey: keys.pk,
            privateKey: keys.sk,
            publicKeyHash: keys.pkh,
            seed: '',
            storeType: conseiljs.StoreType.Fundraiser
        };

        try {
            Logger.warn('Activating the account....');
            let activationResult = await conseiljs.TezosNodeWriter.sendIdentityActivationOperation(tezosNode, keystore, keys.secret);
            
            const activationGroupid = this.clearRPCOperationGroupHash(activationResult.operationGroupID);
            await conseiljs.TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, activationGroupid, 10, 30+1);

            const revealResult = await conseiljs.TezosNodeWriter.sendKeyRevealOperation(tezosNode, keystore);
            Logger.info(`Testnet faucet account successfully activated: ${keys.label} - ${keys.pkh} \nWith tx hash: ${JSON.stringify(revealResult.operationGroupID)}`);
        } catch(error) {
            Logger.error(`Error occured while activating account : ${error}`);
        }
    }

    async deleteAccount(account) {
        const keys = this.getKeys(account);

        if(!keys) {
            Logger.error(`Couldn't find keys for given account.\nPlease make sure the account exists and added to tezster. Run 'tezster list-accounts' to get all accounts`);
            return;
        }

        if(keys.label.match(/bootstrap[1-5]/)) {
            Logger.error(`Bootstrapped accounts can't be deleted.`);
            return;
        }

        try {
            for(var i=0;i<config.accounts.length;i++) {
                if(config.accounts[i].identity === account  || config.accounts[i].label === account || config.accounts[i].pkh === account) {
                    config.accounts.splice(i, 1);
                }
            }
            for(var i=0;i<config.identities.length;i++) {
                if(config.identities[i].pkh === account  || config.identities[i].label === account) {
                    Logger.info(`Account-'${account}' successfully removed`);
                    config.identities.splice(i, 1);
                    jsonfile.writeFile(confFile, config);
                }
            }
        }
        catch(error) {
            Logger.error(`Error occured while removing account : ${error}`);
        }
    }

    clearRPCOperationGroupHash(ids) {
        return ids.replace(/\'/g, '').replace(/\n/, '');
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

    addIdentity(label, sk, pk, pkh, secret) {
        config.identities.push({
            sk : sk,
            pk: pk,
            pkh : pkh,
            label : label,
            secret: secret || ''
        });
        jsonfile.writeFile(confFile, config);
    }

    addAccount(label, pkh, identity, nodeType) {
        if(nodeType.includes('localhost')) {
            nodeType = 'localnode';
        } else {
            nodeType = 'carthagenet'
        }
        config.accounts.push({
            label : `${nodeType}_`+label,
            pkh : pkh,
            identity : identity
        });
        jsonfile.writeFile(confFile, config);
    }

}

module.exports = { Accounts }

