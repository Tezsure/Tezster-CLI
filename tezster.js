#!/usr/bin/env node
'use strict';
//Load sodium CLI wrappers
const _sodium = require('libsodium-wrappers'),
defaultConfig = {
  provider : "",
  identities : [],
  accounts : [],
  contracts : [],
  programs : [],
},
validCommands = [
  'man',
  'help',
  'clearData',
  'newIdentity',
  'newAccount',
  'freeAccount',
  'newContract',
  'listIdentities',
  'listAccounts',
  'listContracts',
  'balance',
  'setDelegate',
  'transfer',
  'typecheckCode',
  'typecheckData',
  'runCode',
  'contract',
  'storage',
  'head',
  'rpc',
  'provider',
];
const program = require('commander');
const eztzF = require("./cli/eztz.cli.js");
const eztz=eztzF.eztz;
const getBalance = eztzF.getBalance;
var command = process.argv[2], args = process.argv.slice(3);

if (process.argv[2].length <= 2){
    console.error("Please enter a command!");
    process.exit();
}
if (validCommands.indexOf(command) < 0 ) {
    console.error("Invalid command");
    process.exit();
}
//await _sodium.ready;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
eztz.library.sodium = _sodium;
    

// Load config
var jsonfile = require('jsonfile');
var confFile = './config.json';
var config = {};
    jsonfile.readFile(confFile, function(err, obj) {
    if (err){
      jsonfile.writeFile(confFile, defaultConfig);
    } else {
      config = obj;
      }
// Load node
    if (config.provider) eztz.node.setProvider(config.provider);
    });


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

program
.command('getBalance')
.action(function(){
    if (args.length < 1) return console.log("Incorrect usage - eztz balance $tz1");
          var pkh = args[0], f;
          if (f = findKeyObj(config.identities, pkh)) {
            pkh = f.pkh;
          } else if (f = findKeyObj(config.accounts, pkh)) {
            pkh = f.pkh;
          } else if (f = findKeyObj(config.contracts, pkh)) {
            pkh = f.pkh;
          }
          getBalance(pkh).then(function(r){
            return console.log(formatTez(r/100));
          }).catch(function(e){
            return console,log(e);
          });
});

//****** for new Identity creation **************/
program
.command('newIdentity')
.action(function(){
  if (args.length < 1) return console.log("Please enter name for the new identity");

  if (findKeyObj(config.identities, args[0])) return console.log("That identity name is already in use");
  var keys = eztz.crypto.generateKeysNoSeed();
  keys.label = args[0];
  jsonfile.writeFile(confFile, config);
  return console.log("New identity created " + keys.pkh);
});


//******* list of identities */
program
.command('listIdentities')
.action(function(){
  for(var i = 0; i < config.identities.length; i++){
       console.log(config.identities[i].label + " - " + config.identities[i].pkh);
      }
});

program.parse(process.argv);


//Helper Functions
  function findKeyObj(list, t){
    for (var i = 0; i < list.length; i++){
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