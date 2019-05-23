#!/usr/bin/env node
'use strict';

const program = require('commander');

program
.version('0.0.1', '-v, --version')
.command('setup')
.action(function() {
    console.log('setting up tezos node, this could take a while....');
    const { exec } = require('child_process');

    exec('./setup.sh',{cwd : './script'}, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program
.command('start-node')
.action(function() {
    console.log('starting the nodes.....');
    const { exec } = require('child_process');

    exec('./start_nodes.sh',{cwd : './script'}, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program
.command('stop-node')
.action(function() {
    console.log('stopping the nodes....');
    const { exec } = require('child_process');

    exec('./stop_nodes.sh',{cwd : './script'}, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});


//****** for new Identity creation */
program
.command('newIdentity')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz;  
  if (args.length < 1) return console.log("Please enter name for the new identity");

  if (findKeyObj(requiredModule.config.identities, args[0])) return console.log("That identity name is already in use");
  var keys = eztz.crypto.generateKeysNoSeed();
  keys.label = args[0];
  //jsonfile.writeFile(confFile, config);
  return console.log("New identity created " + keys.pkh);
});


//****** for new account creation */
program
.command('newAccount')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz;  
  const config=requiredModule.config; 
  const jsonfile = requiredModule.jsonfile;
  var confFile = requiredModule.confFile;
  if (args.length < 3) return console.log("Incorrect usage - eztz account $id $label $amount $spendable=true $delegatable=true $delegate=$id $fee=0");
          if (findKeyObj(config.accounts, args[1])) return console.log("That account name is already in use");
          var pkh = args[0], f;
          if (f = findKeyObj(config.identities, pkh)) {
            eztz.rpc.account(f, parseFloat(args[2]), true, true, f.pkh, 0).then(function(r){
              config.accounts.push({
                label : args[1],
                pkh : r.contracts[0],
                identity : pkh,
              });
              jsonfile.writeFile(confFile, config);
              return console.log("New faucet account created " + r.contracts[0]);
            }).catch(function(e){
              return console.log(e);
            });
          } else {
            return console.log(pkh + " is not a valid identity");
          }
});


//****** for new contracts creation */
program
.command('newContract')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz;  
  const config=requiredModule.config; 
  const jsonfile = requiredModule.jsonfile;
  var confFile = requiredModule.confFile;
  if (args.length < 5) return console.log("Incorrect usage - eztz originate $id $label $amount $code $init $spendable=false $delegatable=true $delegate=$id $fee=0");
          if (findKeyObj(config.contracts, args[1])) return console.log("That account name is already in use");
          var pkh = args[0], f;
          if (f = findKeyObj(config.identities, pkh)) {
            eztz.rpc.originate(f, parseFloat(args[2]), args[3], args[4], false, true, f.pkh, 0).then(function(r){
              config.contracts.push({
                label : args[1],
                pkh : r.contracts[0],
                identity : pkh,
              });
              jsonfile.writeFile(confFile, config);
              return console.log("New contract created " + r.contracts[0]);
            }).catch(function(e){
              return console.log(e);
            });
          } else {
            return console.log(pkh + " is not a valid identity");
          }
});


//******* freeAccount */
program
.command('freeAccount')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz; 
  const config=requiredModule.config; 
  const jsonfile = requiredModule.jsonfile;
  var confFile = requiredModule.confFile;
  if (args.length < 2) return console.log("Incorrect usage - eztz freeAccount $id $label");
  if (findKeyObj(config.accounts, args[1])) return console.log("That account name is already in use");
  var pkh = args[0], f;
  if (f = findKeyObj(config.identities, pkh)) {
    eztz.rpc.freeAccount(f).then(function(r){
      config.accounts.push({
        label : args[1],
        pkh : r,
        identity : pkh,
      });
      jsonfile.writeFile(confFile, config);
      return console.log("New faucet account created " + r);
    }).catch(function(e){
      return console.log(e);
    });
  } else {
    return console.log(pkh + " is not a valid identity");
  }
});

//******* setDelegate */
program
.command('setDelegate')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz; 
  const config=requiredModule.config; 
  const jsonfile = requiredModule.jsonfile;
  var confFile = requiredModule.confFile;
  if (args.length < 2) return console.log("Incorrect usage - eztz setDelegate $account $delegate");
  var account = args[0], delegate = args[1], f;
  if (f = findKeyObj(config.accounts, account)) {
    keys = findKeyObj(config.identities, f.identity);
    account = f.pkh;
  } else if (f = findKeyObj(config.contracts, account)) {
    keys = findKeyObj(config.identities, f.identity);
    account = f.pkh;
  } else {
    return console.log("No valid identity to for this account");
  }
  if (f = findKeyObj(config.identities, delegate)) {
    delegate = f.pkh;
  }
  eztz.rpc.setDelegate(keys, account, delegate, 0).then(function(r){
    return console.log("Delegation updated - operation hash #" + r.injectedOperation);
  }).catch(function(e){
    return console.log(e);
  });
});



//******* Transfer process */
program
.command('transfer')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz; 
  const config=requiredModule.config; 
  if (args.length < 2) return console.log("Incorrect usage - eztz transfer $amount $from $to $paramters='' $fee=0");
  var amount = parseFloat(args[0]), from = args[1], to = args[2], f;
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
    return console.log("No valid identity to send this transaction");
  }
  if (f = findKeyObj(config.identities, to)) {
    to = f.pkh;
  } else if (f = findKeyObj(config.accounts, to)) {
    to = f.pkh;
  } else if (f = findKeyObj(config.contracts, to)) {
    to = f.pkh;
  }
  eztz.rpc.transfer(keys, from, to, amount, 0).then(function(r){
    return console.log("Transfer complete - operation hash #" + r.injectedOperation);
  }).catch(function(e){
    return console.log(e);
  });
});

//******* list of typecheckCode */
program
.command('typecheckCode')
.action(function(){
  if (args.length < 1) return console.log("Incorrect usage - eztz typcheckCode $code");
  eztz.rpc.typecheckCode(args[0]).then(function(r){
    return console.log("Well typed!");
  }).catch(function(e){
    return console.log(JSON.stringify(e));
  });
});

//******* list of typecheckData */
program
.command('typecheckData')
.action(function(){
  if (args.length < 2) return console.log("Incorrect usage - eztz typecheckData $data $type");
  eztz.rpc.typecheckData(args[0], args[1]).then(function(r){
    return console.log("Well typed!");
  }).catch(function(e){
    return console.log(JSON.stringify(e));
  });
});


//*******for check the balance check */
program
.command('balance')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz;
  const config=requiredModule.config;  
    if (args.length < 1) return console.log("Incorrect usage - eztz balance $tz1");
          var pkh = args[0], f;
          if (f = findKeyObj(config.identities, pkh)) {
            pkh = f.pkh;
          } else if (f = findKeyObj(config.accounts, pkh)) {
            pkh = f.pkh;
          } else if (f = findKeyObj(config.contracts, pkh)) {
            pkh = f.pkh;
          }
          eztz.rpc.getBalance(pkh).then(function(r){
            return console.log(formatTez(r/100));
          }).catch(function(e){
            return console,log(e);
          });
});


//******* RunCcode */
program
.command('runCode')
.action(function(){
  if (args.length < 4) return console.log("Incorrect usage - eztz runCode $code $amount $input $storage $trace=true");
     eztz.rpc.runCode(args[0], parseFloat(args[1]), args[2], args[3], true).then(function(r){
        return console.log(JSON.stringify(r));
      }).catch(function(e){
      return console.log(JSON.stringify(e));
  });
});

//******* Contract */
program
.command('contract')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz; 
  const config=requiredModule.config; 
  if (args.length < 1) return console.log("Incorrect usage - eztz contract $account/contract");
          var pkh = args[0];
          if (f = findKeyObj(config.accounts, pkh)) {
            pkh = f.pkh;
          } else if (f = findKeyObj(config.contracts, pkh)) {
            keys = findKeyObj(config.identities, f.identity);
            pkh = f.pkh;
          }
          eztz.contract.load(pkh).then(function(r){
            console.log(r);
          }).catch(function(r){
            return console.log(r);
          });
});

//******* storage */
program
.command('storage')
.action(function(){
  const requiredModule=require('./requiredModule');
  const eztz=requiredModule.eztz; 
  const config=requiredModule.config; 
  if (args.length < 1) return console.log("Incorrect usage - eztz storage $account/contract");
          var pkh = args[0];
          if (f = findKeyObj(config.accounts, pkh)) {
            pkh = f.pkh;
          } else if (f = findKeyObj(config.contracts, pkh)) {
            keys = findKeyObj(config.identities, f.identity);
            pkh = f.pkh;
          }
          eztz.contract.storage(pkh).then(function(r){
            console.log(r);
          }).catch(function(r){
            return console.log(r);
          });
});


//******* Heads */
program
.command('head')
.action(function(){
    const requiredModule=require('./requiredModule');
    const eztz=requiredModule.eztz;
    eztz.rpc.getHead().then(function(r){
      console.log(r);
    }).catch(function(r){
      return outputError(r);
    });
});

//******* rpc */
program
.command('rpc')
.action(function(){
    const requiredModule=require('./requiredModule');
    const eztz=requiredModule.eztz;
    if (args.length < 1) return console.log("Incorrect usage - eztz rpc $endPoint $data='{}'");
    var e = args[0], d = (typeof args[1] != 'undefined' ? JSON.parse(args[1]) : {});
    eztz.node.query(e, d).then(function(r){
      console.log(r);
    }).catch(function(r){
      return console.log(r);
    });
});

//******* Provider */
program
.command('provider')
.action(function(){
  const requiredModule=require('./requiredModule');  
  const config=requiredModule.config; 
  const jsonfile = requiredModule.jsonfile;
  var confFile = requiredModule.confFile;
    if (args.length < 1) return console.log("Incorrect usage - eztz provider $provider");
          config.provider = args[0];
          jsonfile.writeFile(confFile, config);
          return console.log("Provider updated to " + config.provider);
});

//******* list of identities */
program
.command('listIdentities')
.action(function(){
    const requiredModule=require('./requiredModule');
    const config=requiredModule.config; 
    for (var i in config.identities){
       console.log(config.identities[i].label + " - " + config.identities[i].pkh);
  } 
});


//******* list of accounts */
program
.command('listAccounts')
.action(function(){
    const requiredModule=require('./requiredModule');
    const config=requiredModule.config; 
    for (var i in config.accounts){
      console.log(config.accounts[i].label + " - " + config.accounts[i].pkh + " (" + config.accounts[i].identity + ")");
      } 
});

//******* list of contracts */
program
.command('listContracts')
.action(function(){
    const requiredModule=require('./requiredModule');
    const config=requiredModule.config; 
    for (var i in config.contracts){
      console.log(config.contracts[i].label + " - " + config.contracts[i].pkh + " (" + config.contracts[i].identity + ")");
      }
    });

//******** cleared data  */
program
.command('clearData')
.action(function(){
  const requiredModule=require('./requiredModule');
  const jsonfile = requiredModule.jsonfile;
  var confFile = requiredModule.confFile;
  const defaultConfig=requiredModule.defaultConfig; 
  jsonfile.writeFile(confFile, defaultConfig);
  return console.log('Config file has been cleared!');
});


//******** Invalid command handles */
const validCommands=require('./requiredModule').validCommands;
var command = process.argv[2], args = process.argv.slice(3);
if (process.argv[2].length <= 2){
  console.error("Please enter a command!");
  process.exit();
}
if (validCommands.indexOf(command) < 0 ) {
  console.error("Invalid command");
  process.exit();
}
program.parse(process.argv);


//Helper Functions
  function findKeyObj(list, t){
      for(var i in list){
      if (list[i].pkh == t || list[i].label == t) return list[i];
    }
    return false;
  }
  function formatTez(a){
    return formatMoney(a)+"tz";
  }
  function formatMoney(n, c, d, t){
    var c = isNaN(c = Math.abs(c)) ? 2 : c, 
      d = d == undefined ? "." : d, 
      t = t == undefined ? "," : t, 
      s = n < 0 ? "-" : "", 
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
      j = (j = i.length) > 3 ? j % 3 : 0;
     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
   }
