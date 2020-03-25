const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var eztz = {};
var config = jsonfile.readFileSync(confFile);
const TESTNET_NAME = 'carthagenet';

const { Helper } = require('../helper');

class Transactions {

    async transfer(args) {
        if (args.length < 2) {
            console.log(Helper.outputError('Incorrect usage - tezster transfer <amount> <from> <to>'));
            return;
        }
        await this.loadTezsterConfig();
        this.transferAmount(args).then((result) => {        
            console.log(result);
        });
    }

    async listTransactions() {       
        await this.loadTezsterConfig();    
        console.log(Helper.outputInfo(`For transactions done on ${TESTNET_NAME} node ,you can visit https://${TESTNET_NAME}.tzstats.com for more information`))
        if(Object.keys(config.transactions).length > 0) {        
            for(var i in config.transactions) {
                console.log(Helper.output(JSON.stringify(config.transactions[i])));        
            }
        } else {
            console.log(Helper.outputError('No transactions are Available !!'));        
        }
    }

    transferAmount(args) {    
        var amount = parseFloat(args[0]), from = args[1], to = args[2],
            fees = args[3], f;
        var keys = "main"; 
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

        return eztz.rpc.transfer(from, keys, to, amount, fees, undefined, 10600).then(function(r) {
            Transactions.addTransaction('transfer', r.hash, from, to, amount);
            return Helper.output('Transfer complete - operation hash #' + r.hash);
        }).catch(function(e) {
            return Helper.outputError(e);
        });
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

    async loadTezsterConfig() {
        eztz = require('../../lib/eztz.cli.js').eztz;
        const jsonfile = require('jsonfile');
        config=jsonfile.readFileSync(confFile);
        if (config.provider) {
            eztz.node.setProvider(config.provider);
        }  
        const _sodium = require('libsodium-wrappers');
        await _sodium.ready;
        eztz.library.sodium = _sodium;
    }

}

module.exports = { Transactions }