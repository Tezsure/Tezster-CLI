const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var eztz = {};
var config = jsonfile.readFileSync(confFile);
const ConseilJS = '../../lib/conseiljs';

const {Helper} = require('../../helper');

class Transactions{

constructor(){  
    this.helper = new Helper();
}

confFile = __dirname + '/../../config.json';
jsonfile = require('jsonfile');
config = jsonfile.readFileSync(confFile);

async _transfer() {
    var args = process.argv.slice(3);  
    if (args.length < 2) {
        console.log(this.helper.outputError("Incorrect usage - tezster transfer <amount> <from> <to>"));
        return;
    }
    await this.loadTezsterConfig();
    this.transferAmount(args).then((result) => {        
        console.log(result);
    });
}

async _listTransactions() {       
    await this.loadTezsterConfig();    
    const config = this.config;

    console.log(this.helper.outputInfo('For transactions done on babylonnet node ,you can visit https://babylonnet.tzstats.com for more information'))
    if(Object.keys(config.transactions).length > 0){        
        for(var i in config.transactions){
            console.log(this.helper.output(JSON.stringify(config.transactions[i])));        
        }
    } else{
        console.log(this.helper.outputError("No transactions are Available !!"));        
    }
}


transferAmount(args){    
    var self = this;
    var amount = parseFloat(args[0]), from = args[1], to = args[2],
        fees = args[3], f;
    var keys = "main"; 
    if (f = this.helper.findKeyObj(config.identities, from)) {
      keys = f;
      from = f.pkh;
    } else if (f = this.helper.findKeyObj(config.accounts, from)) {
      keys = this.helper.findKeyObj(config.identities, f.identity);
      from = f.pkh;
    } else if (f = this.helper.findKeyObj(config.contracts, from)) {
      keys = this.helper.findKeyObj(config.identities, f.identity);
      from = f.pkh;
    } else {
      return this.helper.outputError("No valid identity to send this transaction");
    }
    
    if (f = this.helper.findKeyObj(config.identities, to)) {
      to = f.pkh;
    } else if (f = this.helper.findKeyObj(config.accounts, to)) {
      to = f.pkh;
    } else if (f = this.helper.findKeyObj(config.contracts, to)) {
      to = f.pkh;
    }

    fees = fees || 1500;

    return eztz.rpc.transfer(from, keys, to, amount, fees, undefined, 10600).then(function(r){
      self.addTransaction('transfer', r.hash, from, to, amount);
      return self.helper.output("Transfer complete - operation hash #" + r.hash);
    }).catch(function(e){
      return self.helper.outputError(e);
    });
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