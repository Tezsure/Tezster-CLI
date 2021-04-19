const { confFile, NODE_TYPE, TZSTATS_NODE_TYPE } = require('../cli-constants');

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

class Transactions {

    constructor(){
        this.config = jsonfile.readFileSync(confFile);
    }

    async transfer(args) {
        Logger.verbose(`Command : tezster transfer ${args}`);
        if (args.length < 2) {
            Logger.warn('Incorrect usage - tezster transfer <amount(ꜩ)> <from> <to> <--optional gas-fee(muꜩ, default is 3000 muꜩ)>');
            return;
        }
        this.transferAmount(args);
    }

    async listTransactions() {      
        Logger.verbose(`Command : tezster list-transactions`);
        Logger.warn(`For transactions done on '${NODE_TYPE.TESTNET}' or 'mainnet' node ,you can visit 'https://${TZSTATS_NODE_TYPE.TESTNET}.tzstats.com' or 'https://tzstats.com' respectively for more information...`);
        if(Object.keys(this.config.transactions).length > 0) {        
            for(var i in this.config.transactions) {
                Logger.info(JSON.stringify(this.config.transactions[i]));
            }
        } else {
            Logger.error('No transactions are Available !!');
        }
    }

    async transferAmount(args) {
        let amount = parseFloat(args[0]), from = args[1], to = args[2], fees = args[3], f;

        conseiljs.registerLogger(logger);
        conseiljs.registerFetch(fetch);
        logger.setLevel('DEBUG',false);
        
        const tezosNode = this.config.provider;
        let keys = this.getKeys(from), keystore;

        if(isNaN(amount)) {
            Logger.error('please enter amount value in integer....');
            return;
        }

        try {
            keystore = {
                publicKey: keys.pk,
                privateKey: keys.sk,
                publicKeyHash: keys.pkh,
                seed: '',
                storeType: conseiljs.KeyStoreType.Fundraiser
            };
        } catch(error) {
            Logger.error(`Sender account doesn't exist. Run 'tezster list-accounts' to get all accounts.`);
            return;
        }

        if (f = Helper.findKeyObj(this.config.identities, from)) {
            keys = f;
            from = f.pkh;
        } else if (f = Helper.findKeyObj(this.config.accounts, from)) {
            keys = Helper.findKeyObj(this.config.identities, f.identity);
            from = f.pkh;
        } else if (f = Helper.findKeyObj(this.config.contracts, from)) {
            keys = Helper.findKeyObj(this.config.identities, f.identity);
            from = f.pkh;
        } else {
            Logger.error('No valid identity to send this transaction');
            return;
        }
        
        if (f = Helper.findKeyObj(this.config.identities, to)) {
            to = f.pkh;
        } else if (f = Helper.findKeyObj(this.config.accounts, to)) {
            to = f.pkh;
        } else if (f = Helper.findKeyObj(this.config.contracts, to)) {
            to = f.pkh;
        } else {
            to = to;
        }

        fees = fees || 2500;
        amount = amount * 1000000 ;

        try {
            const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keystore.privateKey,'edsk'), -1);

            const result = await conseiljs.TezosNodeWriter.sendTransactionOperation(tezosNode, signer, keystore, to, amount, fees, -1);
            this.addTransaction('transfer', `${result.operationGroupID}`, from, to, amount);
            Logger.info(`Transfer complete - operation hash ${result.operationGroupID}`);
        }
        catch(error) {
            ExceptionHandler.transactionException('transfer', error);
        }
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

module.exports = { Transactions }