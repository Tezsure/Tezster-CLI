'use strict';
const {Accounts} = require('./modules/accounts/accounts.js');
const {Setup} = require('./modules/setup/setup.js');
const {Contracts} = require('./modules/contract/contracts.js');
const {Transactions} = require('./modules/transactions/transactions.js');

class TezsterManager{

constructor(){
    this.Accounts = new Accounts();
    this.Setup = new Setup();
    this.Contracts = new Contracts();
    this.Transactions = new Transactions();
} 

setup(){
    this.Setup._setup();
}

startNodes(){
    this.Setup._startNodes();
}

stopNodes(){
    this.Setup._stopNodes();
}

setProvider(){
    this.Accounts._setProvider();
}

getProvider(){
  this.Accounts._getProvider();
}

listAccounts(){
  this.Accounts._listAccounts();
}

getBalance(){
  this.Accounts._getBalance();
}

createAccount(){
  this.Accounts._createAccount();
}

addTestnetAccount(){
  this.Accounts._addTestnetAccount();
}

activateTestnetAccount(){
  this.Accounts._activateTestnetAccount();
}

listContracts(){
  this.Contracts._listContracts();
}

deployContract(){
  this.Contracts._deployContract();
}

callContract(){
  this.Contracts._callContract();
}

getStorage(){
  this.Contracts._getStorage();
}

addContract(){
  this.Contracts._addContract();
}

transfer(){
  this.Transactions._transfer();
}

listTransactions(){
  this.Transactions._listTransactions();
}
}

module.exports = {TezsterManager};