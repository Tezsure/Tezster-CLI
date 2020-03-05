#!/usr/bin/env node
'use strict';

const program = require("commander");
const {TezsterManager} = require("./tezster-manager");
const tezstermanager = new TezsterManager();

program
.version('0.1.9', '-v, --version')
.command('setup')
.description('To set up Tezos nodes')
.action(function(){  
    tezstermanager.setup();
});

program.command('start-nodes')
.description('Starts Tezos nodes')
.action(function(){  
    tezstermanager.startNodes();
});

program.command('stop-nodes')
.description('Stops Tezos nodes')
.action(function() {
    tezstermanager.stopNodes();
});

//******* To set the Provider */
program
.command('set-provider')
.usage('[http://<ip>:<port>]')
.description('To change the default provider')
.action(function(){  
    tezstermanager.setProvider();
});

//******* To get the Provider */
program
.command('get-provider')
.description('To fetch the current provider')
.action(function(){        
    tezstermanager.getProvider();
});

//******* To get the list accounts */
program
.command('list-accounts')
.description('To fetch all the accounts')
.action(function(){    
    tezstermanager.listAccounts();
});

//*******for check the balance check */
program
.command('get-balance')
.usage('<account/contract(pkh)>')
.description('To get the balance of account/contracts')
.action(function(){
    tezstermanager.getBalance();
});

//******* To Create an account */
program
.command('create-account')
.usage('<identity> <label> <amount>')
.description('To create a new account')
.action(async function(){  
    tezstermanager.createAccount(); 
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

//******* TO get the list Contracts */
program
.command('list-contracts')
.description('To fetch all the contracts')
.action(function(){     
    tezstermanager.listContracts();
});

//*******deploy contract written in Michelson*/
program
.command('deploy')
.usage('<contract-label> <contract-absolute-path> <init-storage-value> <account>')
.description('Deploys a smart contract written in Michelson')
.action(function(){
    tezstermanager.deployContract();
});

//*******calls contract written in Michelson*/
program
.command('call')
.usage('<contract-name/address> <argument-value> <account>')
.description('Calls a smart contract with given value provided in Michelson format')
.action(function(){
    tezstermanager.callContract();
});

//*******gets storage for a contract*/
program
.command('get-storage')
.usage('<contract-name/address>')
.description('Returns current storage for given smart contract')
.action(function(){
    tezstermanager.getStorage();
});

//******* To Create an contract */
program
.command('add-contract')
.usage('<label> <address>')
.description('Adds a smart contract with label for interaction')
.action(async function(){  
    tezstermanager.addContract();    
});

//******* To transfer the amount */
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

program
.on("--help", () => {
    console.log("\nTo know more about particular command usage:\n\ttezster [command] --help");
});

if (process.argv.length <= 2){
    console.log('\x1b[31m%s\x1b[0m', "Error: " +"Please enter a command!");
}
var commands=process.argv[2];
const validCommands = [  "list-Identities",
"list-accounts",
"list-contracts",
"get-balance",
"transfer",
"set-provider",
"get-provider",
"stop-nodes",
"start-nodes",
"setup",
"call",
"deploy",
"help",
"create-account",
"list-transactions",
"get-storage",
"add-testnet-account",
"activate-testnet-account",
"add-contract",
"-v",
"--version",
"--help",
"-h"];
if (validCommands.indexOf(commands) < 0 && process.argv.length >2 ) {
    const availableCommands = validCommands.filter(elem => elem.indexOf(commands) > -1);
    console.log('\x1b[31m%s\x1b[0m', "Error: " + "Invalid command\nPlease run 'tezster --help' to get info about commands ");    
    console.log("\nThe most similar commands are:");
    console.log("\t"+availableCommands.toString().replace(/,/g,"\n\t"));    
}

program.parse(process.argv);
