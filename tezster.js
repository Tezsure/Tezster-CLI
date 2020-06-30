#!/usr/bin/env node
'use strict';

const program = require('commander'),
      { prompt } = require('inquirer'),
      fs = require('fs'),
      { TezsterManager } = require('./tezster-manager'),
      { confFile } = require('./modules/cli-constants'),
      { contractDeployParameters } = require('./utils/contract_deploy_parameters'),
      { contractCallParameters } = require('./utils/contract_call_parameters');

if(!fs.existsSync(confFile)) {
    require('./postinstall');
}

const tezstermanager = new TezsterManager();

/******* To setup tezos nodes on user system */
program
    .version('0.2.4', '-v, --version')
    .command('setup')
    .description('To set up Tezos nodes')
    .action(function(){  
        tezstermanager.setupNodes();
});

/******* To start local tezos nodes on user system*/
program.command('start-nodes')
    .description('Starts Tezos nodes')
    .action(function(){  
        tezstermanager.startNodes();
});

/******* To stop local tezos nodes on user system*/
program.command('stop-nodes')
    .description('Stops Tezos nodes')
    .action(function() {
        tezstermanager.stopNodes();
});

/******* To get local nodes current status*/
program.command('node-status')
    .description('Fetch Tezos local nodes current status')
    .action(function() {
        tezstermanager.nodeStatus();
});

/******* To set the Provider */
program
    .command('set-provider')
    .usage('[http://<ip>:<port>]')
    .description('To change the default provider')
    .action(function(){  
        tezstermanager.setProvider();
});

/******* To get the Provider */
program
    .command('get-provider')
    .description('To fetch the current provider')
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
        tezstermanager.restoreWallet(); 
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
    .usage('<amount> <from> <to>')
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
    console.log('\x1b[31m%s\x1b[0m', 'Error: ' +'Please enter a command!');
}

var commands=process.argv[2];
const validCommands = [  
    'setup',
    'start-nodes',
    'stop-nodes',
    'node-status',
    'get-logs',
    'get-provider',
    'set-provider',
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
