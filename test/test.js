const chai = require("chai"),
      sinon = require("sinon"),
      expect = chai.expect,
      { assert } = require('chai'),
      path = require('path'),
      confFile = path.resolve(__dirname + '/../config.json'),
      jsonfile = require('jsonfile'),
      ContractClass = require('../modules/contract/contracts'),
      AccountClass = require('../modules/accounts/accounts'),
      contract = new ContractClass.Contracts(),
      account = new AccountClass.Accounts();

const CONTRACT_ADDRESS = 'KT1ABCDZ6krSvWKQXNXGRoQQwERm1eYtf123',
      CONTRACT_LABEL = 'samplecontract',
      BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      CONTRACT_INITIAL_STORAGE = "\"tezsure\"",
      CONTRACT_INVOCATION_STORAGE = "\"tezster\"",
      SET_LOCAL_PROVIDER = 'http://localhost:18731';

describe('Test Network Provider', async () => {
    it('set-provider', async () => {
        //spy = sinon.spy(account, 'setProvider');
        var mock = sinon.mock(account);
        var expectation = mock.expects('setProviderAccounts');
        expectation.exactly(1);
        account.setProvider([SET_LOCAL_PROVIDER]);
        mock.verify();
        //expect(spy.calledOnce).to.be.true;
        //expect(spy.calledWith('http://localhost:18731')).to.be.true;
    });

    it('get-provider', async () => {
        //spy = sinon.spy(account, 'getProvider');
        var mock = sinon.mock(account);
        var expectation = mock.expects('getProviderAccounts');
        expectation.exactly(1);
        account.getProvider();
        mock.verify();
        //expect(spy.calledOnce).to.be.true;
    });

});

describe('Faucet Account', async () => {
    it('get-balance', async () => {
        //spy = sinon.spy(account, 'getBalanceAccounts');
        var mock = sinon.mock(account);
        var expectation = mock.expects('getBalanceAccounts');
        expectation.exactly(1);
        //expectation.withArgs('bootstrap1');
        account.getBalance(['bootstrap1']);
        mock.verify();
        //expect(spy.calledOnce).to.be.true;
    });

    it('create-wallet', async () => {
        var mock = sinon.mock(account);
        var expectation = mock.expects('createTestnetWallet');
        expectation.exactly(1);
        account.createWallet(['testwallet']);
        mock.verify();
    });

    it('list-accounts', async () => {
        var mock = sinon.mock(account);
        var expectation = mock.expects('listAccounts');
        expectation.exactly(1);
        account.listAccounts();
        mock.verify();
    });

});

describe('Smart Contract Operations', async () => {
    it('deploy-contract', async () => {
            //spy = sinon.spy(contract, 'deployContract');
            var mock = sinon.mock(contract);
            var expectation = mock.expects('deploy');
            //var expectation = mock.expects('conseiljs.TezosNodeWriter.sendContractOriginationOperation');
            expectation.exactly(1);
            contract.deployContract([CONTRACT_LABEL, '', CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            mock.verify();

        // await contract.deployContract([CONTRACT_LABEL, '', CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT])
        //     const fs = require('fs');
        //     fs.readFile(confFile, (err, data) => {
        //         if (err) {
        //             throw err;
        //         }
        //         let config = JSON.parse(data);
        //         const contractObj = Helper.findKeyObj(config.contracts, CONTRACT_LABEL);
        //         expect(contractObj).to.not.equal(false);
        //     });
    });

    it('invoke-contract', async () => {
        var mock = sinon.mock(contract);
        var expectation = mock.expects('invokeContract');
        expectation.exactly(1);
        contract.callContract([CONTRACT_LABEL, CONTRACT_INVOCATION_STORAGE, BOOTSTRAPPED_ACCOUNT]);
        mock.verify();
    });

    it('get-storage', async () => {
        var mock = sinon.mock(contract);
        var expectation = mock.expects('getContractStorage');
        expectation.exactly(1);
        contract.getStorage([CONTRACT_LABEL]);
        mock.verify();
    });

    it('list-contracts', async () => {
        var mock = sinon.mock(contract);
        var expectation = mock.expects('listContracts');
        expectation.exactly(1);
        contract.listContracts();
        mock.verify();
    });

    it('add-contract', async () => {
        var mock = sinon.mock(contract);
        var expectation = mock.expects('addContractToConfig');
        expectation.exactly(1);
        contract.addContract([CONTRACT_LABEL, CONTRACT_ADDRESS]);
        mock.verify();
    });

    it('list-entry-points', async () => {
        var mock = sinon.mock(contract);
        var expectation = mock.expects('listEntryPoints');
        expectation.exactly(1);
        contract.getEntryPoints(['CONTRACT_FILE_PATH']);
        mock.verify();
    });

    it('delete-contract', async () => {
        var mock = sinon.mock(contract);
        var expectation = mock.expects('deleteContract');
        expectation.exactly(1);
        contract.removeContract([CONTRACT_LABEL]);
        mock.verify();
    });

});

