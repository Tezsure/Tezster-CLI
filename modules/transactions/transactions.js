const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var config = jsonfile.readFileSync(confFile);
const ConseilJS = '../../lib/conseiljs';
const TESTNET_NAME = 'carthagenet';
const Logger = require('../logger');
const { Helper } = require('../helper');

class Transactions {

    async transfer(args) {
        Logger.verbose(`Command : tezster transfer ${args}`);
        if (args.length < 2) {
            Logger.info(Helper.outputError('Incorrect usage - tezster transfer <amount> <from> <to>'));
            return;
        }
        this.transferAmount(args).then((result) => {        
            Logger.info(result);
        });
    }

    async listTransactions() {       
        Logger.verbose(`Command : tezster list-transactions`);
        Logger.info(Helper.outputInfo(`For transactions done on ${TESTNET_NAME} node ,you can visit https://${TESTNET_NAME}.tzstats.com for more information`))
        if(Object.keys(config.transactions).length > 0) {        
            for(var i in config.transactions) {
                Logger.info(Helper.output(JSON.stringify(config.transactions[i])));        
            }
        } else {
            Logger.info(Helper.outputError('No transactions are Available !!'));        
        }
    }

    async transferAmount(args) {
        var amount = parseFloat(args[0]), from = args[1], to = args[2], fees = args[3], f;
        
        const conseiljs = require(ConseilJS);
        const tezosNode = config.provider;
        var keys = this.getKeys(from);

        const keystore = {
            publicKey: keys.pk,
            privateKey: keys.sk,
            publicKeyHash: keys.pkh,
            seed: '',
            storeType: conseiljs.StoreType.Fundraiser
        };

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
            return Helper.outputError('No valid identity to send this transaction');
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
            Transactions.addTransaction('transfer', `${JSON.stringify(result.operationGroupID)}`, from, to, amount);
            return Helper.output(`Transfer complete - operation hash #${JSON.stringify(result.operationGroupID)}`);
        }
        catch(error) {
            return Helper.outputError(error);
        }
    }

    static addTransaction(operation, opHash, from, to, amount) {
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