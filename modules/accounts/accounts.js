const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var eztz = {};
var config = jsonfile.readFileSync(confFile);
const TESTNET_NAME = 'carthagenet';

const Logger = require('../logger');
const { Helper } = require('../helper');

class Accounts{

    async setProvider(args){
        Logger.verbose(`Command : tezster set-provider ${args}`);
        if (args.length < 1){ 
            Logger.info(Helper.outputError('Incorrect usage - tezster set-provider http://<ip>:<port>'));
            return;
        }
        await this.loadTezsterConfig(); 
        Logger.info(this.setProviderAccounts(args));
    }

    async getProvider() {
        Logger.verbose(`Command : tezster get-provider`);
        await this.loadTezsterConfig(); 
        Logger.info(this.getProviderAccounts());
    }

    async listAccounts() {  
        Logger.verbose(`Command : tezster list-accounts`);
        await this.loadTezsterConfig();
        if(Object.keys(config.accounts).length > 0) {
            for(var i in config.accounts) {
                Logger.info(Helper.output(config.accounts[i].label + ' - ' + config.accounts[i].pkh + '(' + config.accounts[i].identity + ')'));
            }
        } else {    
            Logger.info(Helper.outputError('No Account is available !!'));        
        }
    }

    async getBalance(args) {
        Logger.verbose(`Command : tezster get-balance ${args}`);
        if (args.length < 1) {
            Logger.info(Helper.outputInfo('Incorrect usage of get-balance command \nCorrect usage: - tezster get-balance <account/contract>'));
            return;
        }
        await this.loadTezsterConfig();
        this.getBalanceAccounts(args[0]).then((result) => {
            Logger.info(result);
        });
    }

    async createAccount(args) {   
        Logger.verbose(`Command : tezster create-account ${args}`);
        if (args.length < 3) return Logger.info(Helper.outputError('Incorrect usage - tezster create-account <Identity> <Account Label> <amount> <spendable=true[Optional]> <delegatable=true[Optional]> <delegate[Optional]> <fee=0[Optional]>'));
        await this.loadTezsterConfig(); 
        this.createTestnetAccount(args).then((result) => {
            Logger.info(result);
        });
    }

    async addTestnetAccount(args) {  
        Logger.verbose(`Command : tezster add-testnet-account ${args}`);
        if (args.length < 2) {
            Logger.info(Helper.outputInfo('Incorrect usage of add-testnet-account command \nCorrect usage: - tezster add-testnet-account <account-label> <absolut-path-to-json-file>'));
            return;
        }
        await this.loadTezsterConfig(); 
        let result = this.restoreAlphanetAccount(args[0], args[1]);
        Logger.info(result);
    }

    async activateTestnetAccount(args) {  
        Logger.verbose(`Command : tezster activate-testnet-account ${args}`);
        if (args.length < 1) {
            Logger.info(Helper.outputInfo('Incorrect usage of activate-testnet-account command \nCorrect usage: - tezster activate-testnet-account <account-label>'));
            return;
        }
        await this.loadTezsterConfig(); 
        
        let result = await this.activateAlphanetAccount(args[0]);
        Logger.info(result);
        Logger.info(Helper.outputInfo(`If this account has already been activated, it may throw 'invalid_activation' error. You can visit https://${TESTNET_NAME}.tzstats.com for more information on this account`));
    }

    setProviderAccounts(args){    
        config.provider = args[0];
        jsonfile.writeFile(confFile, config);
        eztz.node.setProvider(config.provider);
        return Helper.outputInfo('Provider updated to ' + config.provider);
    }

    getProviderAccounts(){    
        if (config.provider) {
            return Helper.outputInfo(config.provider);
        } else {
            return Helper.outputInfo('No provider is set');
        } 
    }

    getBalanceAccounts(account) {
        var pkh = account, f;
        if (f = Helper.findKeyObj(config.identities, pkh)) {
            pkh = f.pkh;
        } else if (f = Helper.findKeyObj(config.accounts, pkh)) {
            pkh = f.pkh;
        } else if (f = Helper.findKeyObj(config.contracts, pkh)) {
            pkh = f.pkh;
        }
        return eztz.rpc.getBalance(pkh).then(function(r){
            return Helper.output(Helper.formatTez(r/100));
        }).catch(function(e){
            return Helper.outputError(e);
        });
    }

    createTestnetAccount(args){
        var pkh = args[0], f;  
        if (Helper.findKeyObj(config.accounts, args[1])) 
        return Logger.info(Helper.outputError('That account name is already in use'));
        if (f = Helper.findKeyObj(config.identities, pkh)) {
            return eztz.rpc.account(f, parseFloat(args[2]), true, true,f.pkh, 1400).then(function(r) {                  
                var d=eztz.contract.hash(r.hash, 0);        
                config.accounts.push({
                    label : args[1],
                    pkh : d,
                    identity : pkh,        
                });
                jsonfile.writeFile(confFile, config);
                return Helper.output('New account created ' + args[1]);
            }).catch(function(e) {           
                return Helper.outputError(e);
            });
        } else {
            return Helper.outputError(pkh + ' is not a valid identity');
        }
    }

    async loadTezsterConfig() {
        eztz = require('../../lib/eztz.cli.js').eztz;
        const jsonfile = require('jsonfile');
        config = jsonfile.readFileSync(confFile);
        if (config.provider) {
            eztz.node.setProvider(config.provider);
        }  
        const _sodium = require('libsodium-wrappers');
        await _sodium.ready;
        eztz.library.sodium = _sodium;
    }

    restoreAlphanetAccount(accountLabel, accountFilePath) {
        const fs = require('fs');
        const keys = this.getKeys(accountLabel);
        if(keys) {
            return Helper.outputError(` Account with this label already exists.`);
        }
        try {
            let accountJSON = fs.readFileSync(accountFilePath, 'utf8');
            accountJSON = accountJSON && JSON.parse(accountJSON);
            if(!accountJSON) {
                return Helper.outputError(` occured while restroing account : empty JSON file`);
            }
            let mnemonic = accountJSON.mnemonic;
            let email = accountJSON.email;
            let password = accountJSON.password;
            if (!mnemonic || !email || !password) {
                return Helper.outputError(` occured while restroing account : invalid JSON file`);
            }
            mnemonic = mnemonic.join(' ');
            
            /* 
            make sure eztz.cli.js uses 'mnemonicToSeedSync' under 'generateKeys' always.
            */

            const alphakeys = eztz.crypto.generateKeys(mnemonic, email+password);
        
            this.addIdentity(accountLabel, alphakeys.sk, alphakeys.pk, alphakeys.pkh, accountJSON.secret);
            this.addAccount('aplha_'+ accountLabel, alphakeys.pkh, accountLabel);
            return Helper.output(`successfully restored testnet faucet account: ${accountLabel}-${alphakeys.pkh}`);
        } catch(error) {
            return Helper.outputError(` occured while restroing account : ${error}`);
        }
    }

    async activateAlphanetAccount(account) {
        const keys = this.getKeys(account);
        if(!keys || !keys.secret) {
            return Helper.outputError(`Couldn't find keys for given account.\nPlease make sure the account exists and added to tezster.`);
        }
        try {
            let activationResult = await eztz.rpc.activate(keys.pkh, keys.secret);
            return Helper.output(`successfully activated testnet faucet account: ${keys.label} : ${keys.pkh} \n with tx hash: ${activationResult}`);
        } catch(error) {
            return Helper.outputError(` occured while activating account : ${error}`);
        }
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

    addAccount(label, pkh, identity) {
        config.accounts.push({
            label : label,
            pkh : pkh,
            identity : identity
        });
        jsonfile.writeFile(confFile, config);
    }

}

module.exports = { Accounts }

