'use strict';
const {Accounts} = require('./modules/accounts/accounts.js');
const {Setup} = require('./modules/setup/setup.js');
const {Contracts} = require('./modules/contract/contracts.js');
const {Transactions} = require('./modules/transactions/transactions.js');

class TezsterManager{

  constructor(){
      this.accounts = new Accounts();
      this.setup = new Setup();
      this.contracts = new Contracts();
      this.transactions = new Transactions();
  } 

  setUp(){
      this.setup.setup();
  }

  startNodes(){
      this.setup.startNodes();
  }

  stopNodes(){
      this.setup.stopNodes();
  }

  setProvider(){
      this.accounts.setProvider();
  }

  getProvider(){
    this.accounts.getProvider();
  }

  listAccounts(){
    this.accounts.listAccounts();
  }

  getBalance(){
    this.accounts.getBalance();
  }

  createAccount(){
    this.accounts.createAccount();
  }

  addTestnetAccount(){
    this.accounts.addTestnetAccount();
  }

  activateTestnetAccount(){
    this.accounts.activateTestnetAccount();
  }

  listContracts(){
    this.contracts.listContracts();
  }

  deployContract(){
    this.contracts.deployContract();
  }

  callContract(){
    this.contracts.callContract();
  }

  getStorage(){
    this.contracts.getStorage();
  }

  addContract(){
    this.contracts.addContract();
  }

  transfer(){
    this.transactions.transfer();
  }

  listTransactions(){
    this.transactions.listTransactions();
  }
}

module.exports = {TezsterManager};