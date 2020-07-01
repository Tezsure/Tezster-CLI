const { confFile, CONSEIL_JS, TESTNET_NAME } = require('../cli-constants');

const jsonfile = require('jsonfile'),      
      Logger = require('../logger'),
      { Helper } = require('../helper'),
      { ExceptionHandler } = require('../exceptionHandler');

let config;

class Transactions {

    constructor(){
        config = jsonfile.readFileSync(confFile);
    }

    async transfer(args) {
        Logger.verbose(`Command : tezster transfer ${args}`);
        if (args.length < 2) {
            Logger.error('Incorrect usage - tezster transfer <amount> <from> <to>');
            return;
        }
        this.transferAmount(args);
    }

    async listTransactions() {      
        Logger.verbose(`Command : tezster list-transactions`);
        Logger.warn(`For transactions done on ${TESTNET_NAME} node ,you can visit https://${TESTNET_NAME}.tzstats.com for more information`);
        if(Object.keys(config.transactions).length > 0) {        
            for(var i in config.transactions) {
                Logger.info(JSON.stringify(config.transactions[i]));
            }
        } else {
            Logger.error('No transactions are Available !!');
        }
    }

    async transferAmount(args) {
        let amount = parseFloat(args[0]), from = args[1], to = args[2], fees = args[3], f;
        
        const conseiljs = require(CONSEIL_JS);
        const tezosNode = config.provider;
        const keys = this.getKeys(from);

        if(isNaN(amount)) {
            Logger.error('please enter amount value in integer....');
            return;
        }

        try {
            const keystore = {
                publicKey: keys.pk,
                privateKey: keys.sk,
                publicKeyHash: keys.pkh,
                seed: '',
                storeType: conseiljs.StoreType.Fundraiser
            };
        } catch(error) {
            Logger.error(`Sender account doesn't exist ....`);
        }

        if (f = Helper.findKeyObj(config.identities, from)) {
            keys = f;
            from = f.pkh;
        } else if (f = Helper.findKeyObj(config.accounts, from)) {
            keys = Helper.findKeyObj(config.identities, f.identity);
            from = f.pkh;
        } else if (f = Helper.findKeyObj(config.contracts, from)) {
            keys = Helper.findKeyObj(config.identities, f.identity);
            from = f.pkh;
        } else {
            Logger.error('No valid identity to send this transaction');
            return;
        }
        
        if (f = Helper.findKeyObj(config.identities, to)) {
            to = f.pkh;
        } else if (f = Helper.findKeyObj(config.accounts, to)) {
            to = f.pkh;
        } else if (f = Helper.findKeyObj(config.contracts, to)) {
            to = f.pkh;
        }

        fees = fees || 1500;
        amount = amount * 1000000 ;

        try {
            const result = await conseiljs.TezosNodeWriter.sendTransactionOperation(tezosNode, keystore, to, amount, fees, '');
            this.addTransaction('transfer', `${result.operationGroupID}`, from, to, amount);
            Logger.info(`Transfer complete - operation hash ${result.operationGroupID}`);
        }
        catch(error) {
            ExceptionHandler.transactionException('transfer', error);
        }
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

module.exports = { Transactions }