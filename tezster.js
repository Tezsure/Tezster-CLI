#!/usr/bin/env node
'use strict';

const program = require('commander'),
      { prompt } = require('inquirer'),
      fs = require('fs'),
      { TezsterManager } = require('./tezster-manager'),
      { confFile } = require('./modules/cli-constants'),
      { setupStopNodesParameters } = require('./utils/setup.stopNodes.parameters'),
      { accountSetProviderParameters } = require('./utils/account.setProvider.parameters'),
      { accountRestoreWalletParameters } = require('./utils/account.restoreWallet.parameters'),
      { contractDeployParameters } = require('./utils/contracts.deploy.parameters'),
      { contractCallParameters } = require('./utils/contracts.call.parameters');

if(!fs.existsSync(confFile)) {
    require('./postinstall');
}

const tezstermanager = new TezsterManager();

/******* To setup tezos nodes on user system */
program
    .version('0.2.7', '-v, --version')
    .command('setup')
    .description('To set up Tezos nodes')
    .action(function(){  
        tezstermanager.setupNodes();
});

/******* To start local tezos nodes on user system*/
program.command('start-nodes')
    .description(`Starts local Tezos nodes`)
    .action(function(){  
        tezstermanager.startNodes();
});

/******* To stop local tezos nodes on user system*/
program.command('stop-nodes')
    .usage(`\n(This command provides the interactive shell)`)
    .description(`Stops local Tezos nodes`)
    .action(function() {
        if (process.argv.length > 3) {
            console.log('Incorrect usage of stop-nodes command. Correct usage: - tezster stop-nodes');
            return;
        }
        prompt(setupStopNodesParameters).then((setupStopNodesParametersResponse) => {
                if(setupStopNodesParametersResponse.response) {
                    tezstermanager.stopNodes();
                }
        });
});

/******* To get local nodes current status*/
program.command('node-status')
    .description('Fetch Tezos local nodes current status')
    .action(function() {
        tezstermanager.nodeStatus();
});

/******* To set the rpc-node */
program
    .command('set-rpc-node')
    .usage(`\n(This command provides the interactive shell)`)
    .description('To change the default rpc node provider')
    .action(function() {
        if (process.argv.length > 3) {
            console.log('Incorrect usage of set-rpc-node command. Correct usage: - tezster set-rpc-node');
            return;
        }
        prompt(accountSetProviderParameters).then(accountSetProviderParameterValues => {
            tezstermanager.setProvider(accountSetProviderParameterValues);
        });
});

/******* To get the current rpc-node */
program
    .command('get-rpc-node')
    .description('To fetch the current rpc node')
    .action(function(){        
        tezstermanager.getProvider();
});

/******* To get the list accounts */
program
    .command('list-accounts')
    .description('To fetch all the accounts')
    .action(function(){
        tezstermanager.listAccounts();
});

/*******for check the balance check */
program
    .command('get-balance')
    .usage('<account/contract(pkh)>')
    .description('To get the balance of account/contracts')
    .action(function(){
        tezstermanager.getBalance();
});

/******* To Create an account */
program
    .command('create-wallet')
    .usage('<wallet-label>')
    .description('To create a new account')
    .action(function(){  
        tezstermanager.createWallet(); 
});

/* Restores an testnet faucet account */
program
    .command('add-testnet-account')
    .usage('<account-label> <absolut-path-to-json-file>')
    .description('Restores a testnet faucet account from json file')
    .action(function(){
        tezstermanager.addTestnetAccount();
});

/* Restores an testnet faucet account */
program
    .command('activate-testnet-account')
    .usage('<account-label>')
    .description('Activates a testnet faucet account resored using tezster')
    .action(function(){
        tezstermanager.activateTestnetAccount();
});

/******* To restore an existing wallet */
program
    .command('restore-wallet')
    .usage(`<wallet-label/identity/hash> <mnemonic-phrase> \n(Note: Mnemonic phrase must be enclose between '')`)
    .description('To restore an existing wallet using mnemonic')
    .action(function(){  
        if (process.argv.length <=3 || process.argv.length > 4) {
            console.log('Incorrect usage of restore-wallet command. Correct usage: - tezster restore-wallet <label>');
            return;
        }
        prompt(accountRestoreWalletParameters).then(accountRestoreWalletParameterValues => {
            if(Object.values(accountRestoreWalletParameterValues)[0] === 'Mnemonic Phrases') {
                tezstermanager.restoreWalletUsingMnemonic(process.argv[3], Object.values(accountRestoreWalletParameterValues)[1]);
            } else {
                tezstermanager.restoreWalletUsingSecret(process.argv[3], Object.values(accountRestoreWalletParameterValues)[1]);
            }
        });
    });

/******* To remove an account */
program
    .command('remove-account')
    .usage('<account-label/identity/hash>')
    .description('To remove an existing account')
    .action(function(){  
        tezstermanager.removeAccount(); 
});

/******* TO get the list Contracts */
program
    .command('list-contracts')
    .description('To fetch all the contracts')
    .action(function(){     
        tezstermanager.listContracts();
});

/*******deploy contract written in Michelson*/
program
    .command('deploy')
    .usage(`\n(This command provides the interactive shell)`)
    .description('Deploys a smart contract written in Michelson')
    .action(function() {
        if (process.argv.length > 3) {
            console.log('Incorrect usage of deploy command. Correct usage: - tezster deploy');
            return;
        }
        prompt(contractDeployParameters).then(deployParamaterValues => {
            tezstermanager.deployContract(deployParamaterValues);
        });
});


/*******calls contract written in Michelson*/
program
    .command('call')
    .usage(`\n(This command provides the interactive shell)`)
    .description('Calls a smart contract with given value provided in Michelson format')
    .action(function() {
        if (process.argv.length > 3) {
            console.log('Incorrect usage of call command. Correct usage: - tezster call');
            return;
        }
        prompt(contractCallParameters).then(callParamaterValues => {
            tezstermanager.callContract(callParamaterValues);
        });
});

/*******gets storage for a contract*/
program
    .command('get-storage')
    .usage('<contract-name/address>')
    .description('Returns current storage for given smart contract')
    .action(function(){
        tezstermanager.getStorage();
});

/******* To Create an contract */
program
    .command('add-contract')
    .usage('<label> <address>')
    .description('Adds a smart contract with label for interaction')
    .action(function(){  
        tezstermanager.addContract();    
});

/******* To remove a contract */
program
    .command('remove-contract')
    .usage('<contract-label>')
    .description('To remove deployed contract from list')
    .action(function(){  
        tezstermanager.removeContract(); 
});

/******* To transfer the amount */
program
    .command('transfer')
    .usage('<amount(ꜩ)> <from> <to> <--optional gas-fee(muꜩ, default is 3000 muꜩ)>')
    .description('To transfer the funds between accounts')
    .action(function(){
        tezstermanager.transfer();
});

/* list transactions done with tezster */
program
    .command('list-transactions')
    .description('List down all the transactions')
    .action(function(){  
        tezstermanager.listTransactions();
});

/* list down all the entry points and initial storage format from smart contract */
program
    .command('list-entry-points')
    .usage('<contract-absolute-path/contract-address>')
    .description('List down all entry points and initial storage format from smart contract')
    .action(function(){
        tezstermanager.listEntryPoints();
});

/* Get all logs file in archive file fromat on user system */
program
    .command('get-logs')
    .description('Fetch log files on user system in archive file format')
    .action(function(){  
        tezstermanager.getLogFiles();
});

program
    .on('--help', () => {
        console.log('\nTo know more about particular command usage:\n\ttezster [command] --help');
});

if (process.argv.length <= 2){
    program.help();
}

var commands=process.argv[2];
const validCommands = [  
    'setup',
    'start-nodes',
    'stop-nodes',
    'node-status',
    'get-logs',
    'get-rpc-node',
    'set-rpc-node',
    'transfer',
    'get-balance',
    'list-entry-points', 
    'deploy',
    'call',
    'get-storage',
    'add-contract',
    'list-contracts',
    'remove-contract',
    'list-accounts',
    'create-wallet',
    'restore-wallet',
    'remove-account',
    'add-testnet-account',
    'activate-testnet-account',
    'list-transactions',
    '-v',
    '--version',
    '--help',
    '-h'];

if (validCommands.indexOf(commands) < 0 && process.argv.length >2 ) {
    const re = RegExp(`.*${commands.toLowerCase().split('').join('.*')}.*`)
    const availableCommands = validCommands.filter(elem => elem.match(re));
    console.log('\x1b[31m%s\x1b[0m', 'Error: ' + `Invalid command\nPlease run 'tezster --help' to get info about commands `);    
    if(availableCommands.toString()) {
        console.log('\nThe most similar commands are:');
        console.log('\t'+availableCommands.toString().replace(/,/g,'\n\t'));   
    } 
}

program.parse(process.argv);
