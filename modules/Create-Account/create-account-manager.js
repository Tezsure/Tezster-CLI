const {findKeyObj, config, outputError, output} = require("../../tezster-manager");

function createAccount(args){
    var pkh = args[0], f;  
    if (findKeyObj(config.accounts, args[1])) return console.log(outputError("That account name is already in use"));
    if (f = findKeyObj(config.identities, pkh)) {
        return eztz.rpc.account(f, parseFloat(args[2]), true, true,f.pkh, 1400).then(function(r){                  
                var d=eztz.contract.hash(r.hash, 0);        
                config.accounts.push({
                  label : args[1],
                  pkh : d,
                  identity : pkh,        
                });
                jsonfile.writeFile(confFile, config);
                return output("New account created " + args[1]);
            }).catch(function(e){           
                return outputError(e);
              });
    } else {
        return outputError(pkh + " is not a valid identity");
    }
  }

module.exports = { createAccount };