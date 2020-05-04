const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var config = jsonfile.readFileSync(confFile);
const CONSEIL_JS = '../../lib/conseiljs';
const TESTNET_NAME = 'carthagenet';
const Logger = require('../logger');
const { Helper } = require('../helper');

class Transactions {

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
        let keys = this.getKeys(from);
        if(!keys) {
            Logger.error(`Sender account label doesn't exist.`);
            return;
        }

        if(!this.getKeys(to)) {
            Logger.error(`Receiver account doesn't exist.`);
            return;
        }

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
            if(error.toString().includes(`checksum`)) {
                Helper.errorHandler(`Error occured while transferring tez ${error}`, `Account doesn't  exists or not activated on the network.... To list down all accounts run 'tezster list-accounts'`);
            } else if(error.toString().includes(`empty_implicit_contract`)) {
                Helper.errorHandler(`Error occured while transferring tez ${error}`, `Account is not activated on the current provider`);
            } else if(error.toString().includes(`connect ECONNREFUSED`)) {
                Helper.errorHandler(`Error occured while fetching balance: ${error}`, `Make sure local nodes are in running state....`);
            } else {
                Helper.errorHandler(`Error occured while transferring tez ${error}`, `Account doesn't exists or not activated on the current testnet provider....`);
            }
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