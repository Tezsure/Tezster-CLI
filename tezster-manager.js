'use strict';
const { Accounts } = require('./modules/accounts/accounts.js'),
      { Setup } = require('./modules/setup/setup.js'),
      { Contracts } = require('./modules/contract/contracts.js'),
      { Transactions } = require('./modules/transactions/transactions.js');

class TezsterManager{

    constructor(){
        this.accounts = new Accounts();
        this.setup = new Setup();
        this.contracts = new Contracts();
        this.transactions = new Transactions();
    } 
    
    setupNodes(){
        this.setup.setup();
    }

    startNodes(){
        this.setup.startNodes();
    }

    stopNodes(){
        this.setup.stopNodes();
    }

    nodeStatus(){
        this.setup.nodeStatus();
    }

    getLogFiles(){
        this.setup.getLogFiles();
    }

    setProvider(accountSetProviderParameterValues){
        this.accounts.setProvider(accountSetProviderParameterValues);
    }

    getProvider(){
        this.accounts.getProvider();
    }

    listAccounts(){
        this.accounts.listAccounts();
    }

    getBalance(args){
        this.accounts.getBalance(args);
    }

    createWallet(args){
        this.accounts.createWallet(args);
    }

    addTestnetAccount(args){
        this.accounts.addTestnetAccount(args);
    }

    activateTestnetAccount(args){
        this.accounts.activateTestnetAccount(args);
    }

    restoreWallet(args){
        this.accounts.restoreWallet(args);
    }

    listContracts(){
        this.contracts.listContracts();
    }

    removeAccount(args){
        this.accounts.removeAccount(args);
    }

    deployContract(deployParamaterValues){
        this.contracts.deployContract(deployParamaterValues);
    }

    callContract(callParamaterValues){
        this.contracts.callContract(callParamaterValues);
    }

    getStorage(args){
        this.contracts.getStorage(args);
    }

    addContract(args){
        this.contracts.addContract(args);
    }

    listEntryPoints(args){
        this.contracts.getEntryPoints(args);
    }

    removeContract(args){
        this.contracts.removeContract(args);
    }

    transfer(args){
        this.transactions.transfer(args);
    }

    listTransactions(){
        this.transactions.listTransactions();
    }
}

module.exports = {TezsterManager};