'use strict';
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

// load config
const jsonfile = require('jsonfile');
var confFile = './config.json';
var config=jsonfile.readFileSync(confFile);
  if (config.provider) eztz.node.setProvider(config.provider);
var eztz = require('./cli/eztz.cli.js').eztz;

  module.exports={
      config:config,
      eztz:eztz,
      validCommands:validCommands,
      defaultConfig:defaultConfig    
    };
