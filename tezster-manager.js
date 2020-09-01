'use strict';
const { Accounts } = require('./modules/accounts/accounts.js'),
      { Setup } = require('./modules/setup/setup.js'),
      { Contracts } = require('./modules/contract/contracts.js'),
      { Transactions } = require('./modules/transactions/transactions.js');
var args = process.argv.slice(3);

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

    getBalance(){
        this.accounts.getBalance(args);
    }

    createWallet(){
        this.accounts.createWallet(args);
    }

    addTestnetAccount(){
        this.accounts.addTestnetAccount(args);
    }

    activateTestnetAccount(){
        this.accounts.activateTestnetAccount(args);
    }

    restoreWalletUsingMnemonic(label, accountRestoreWalletParameterValues){
        this.accounts.restoreWalletUsingMnemonic(label, accountRestoreWalletParameterValues);
    }

    restoreWalletUsingSecret(label, accountRestoreWalletParameterValues){
        this.accounts.restoreWalletUsingSecret(label, accountRestoreWalletParameterValues);
    }

    listContracts(){
        this.contracts.listContracts();
    }

    removeAccount(){
        this.accounts.removeAccount(args);
    }

    deployContract(deployParamaterValues){
        this.contracts.deployContract(deployParamaterValues);
    }

    deployContractNonInterativeMode(){
        this.contracts.deployContract(args[0], args[1], args[2], args[3], args[4]);
    }

    deployContractInterativeMode(deployParamaterValues){
        this.contracts.deployContract(deployParamaterValues.contractLabel, deployParamaterValues.contractAbsolutePath, deployParamaterValues.initStorageValue, deployParamaterValues.account, deployParamaterValues.amount, deployParamaterValues.fee, deployParamaterValues.storageLimit, deployParamaterValues.gasLimit);
    }

    callContractNonInterativeMode(){
        this.contracts.callContract(args[0], args[1], args[2], args[3]);
    }

    callContractInterativeMode(callParamaterValues){
        this.contracts.callContract(callParamaterValues.contractLabel, callParamaterValues.contractArgs, callParamaterValues.account, callParamaterValues.amount, callParamaterValues.fee, callParamaterValues.storageLimit, callParamaterValues.gasLimit);
    }

    getStorage(){
        this.contracts.getStorage(args);
    }

    addContract(){
        this.contracts.addContract(args);
    }

    listEntryPoints(){
        this.contracts.getEntryPoints(args);
    }

    removeContract(){
        this.contracts.removeContract(args);
    }

    transfer(){
        this.transactions.transfer(args);
    }

    listTransactions(){
        this.transactions.listTransactions();
    }
}

module.exports = {TezsterManager};