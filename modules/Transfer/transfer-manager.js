const {findKeyObj, config, outputError, output, addTransaction} = require("../../tezster-manager");

function transferAmount(args){    
    var amount = parseFloat(args[0]), from = args[1], to = args[2],
        fees = args[3], f;
    var keys = "main"; 
    if (f = findKeyObj(config.identities, from)) {
      keys = f;
      from = f.pkh;
    } else if (f = findKeyObj(config.accounts, from)) {
      keys = findKeyObj(config.identities, f.identity);
      from = f.pkh;
    } else if (f = findKeyObj(config.contracts, from)) {
      keys = findKeyObj(config.identities, f.identity);
      from = f.pkh;
    } else {
      return outputError("No valid identity to send this transaction");
    }
    
    if (f = findKeyObj(config.identities, to)) {
      to = f.pkh;
    } else if (f = findKeyObj(config.accounts, to)) {
      to = f.pkh;
    } else if (f = findKeyObj(config.contracts, to)) {
      to = f.pkh;
    }

    fees = fees || 1500;

    return eztz.rpc.transfer(from, keys, to, amount, fees, undefined, 10600).then(function(r){
      addTransaction('transfer', r.hash, from, to, amount);
      return output("Transfer complete - operation hash #" + r.hash);
    }).catch(function(e){
      return outputError(e);
    });
    
}

module.exports = { transferAmount };