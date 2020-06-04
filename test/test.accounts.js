const chai = require("chai"),
      sinon = require("sinon"),
      expect = chai.expect,
      { assert } = require('chai'),
      fs = require('fs'),
      path = require('path'),
      jsonfile = require('jsonfile'),
      { RpcRequest } = require('../modules/rpc-util'),

      confFile = '/tmp/tezster/config.json',
      sampleconfFile = path.resolve(__dirname, './config/test-config.json'),
      testconfig = jsonfile.readFileSync(sampleconfFile),

      CONSEIL_JS = '../lib/conseiljs',
      Logger = require('../modules/logger'),
      { Helper } = require('../modules/helper'),
      AccountClass = require('../modules/accounts/accounts'),
      {  } = require('./responses/TezosOperations.responses');

const BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      tezosNode = 'http://localhost:18731',
      BALANCE = 40000000000,
      keystore = {
          publicKey: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
          privateKey: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
          publicKeyHash: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
          seed: '',
          storeType: 1
      };

describe('Faucet Account Operations', async () => {
    let sandbox = null;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox
        .stub(jsonfile, 'readFileSync')
        .withArgs(confFile)
        .returns(testconfig);
        account = new AccountClass.Accounts();
    })
    afterEach(() => {
      sandbox.restore()
    })

    context('get-provider', async () => {
        it('should get provider', async () => { 
            spyGetProviderAccounts = sinon.spy(account, 'getProviderAccounts');
            stubLoggerInfo = sandbox.stub(Logger, 'info');

            account.getProvider();
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(spyGetProviderAccounts);
        });
    });

    context('set-provider', async () => {
        it('should set provider', async () => { 
            spySetProviderAccounts = sinon.spy(account, 'setProviderAccounts');
            const stubLoggerInfo = sandbox.stub(Logger, 'info');
            sandbox.stub(jsonfile, 'writeFile')
                .withArgs(confFile, testconfig);

            account.setProvider([tezosNode]);
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(spySetProviderAccounts);
        });
    });

    context('get-balance-with-args', async () => {
        it('should return balance', async () => { 
            spyGetBalanceAccounts = sinon.spy(account, 'getBalanceAccounts');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            
            stubHelper = sandbox
                        .stub(Helper, 'findKeyObj')
                        .withArgs(testconfig.contracts, BOOTSTRAPPED_ACCOUNT)
                        .returns({
                            "label": "localnode_bootstrap1",
                            "pkh": "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx",
                            "identity": "bootstrap1"
                          });

            stubRpcRequest = sandbox.stub(RpcRequest, 'fetchBalance')
                                .withArgs(testconfig.provider, BOOTSTRAPPED_ACCOUNT)
                                .returns(BALANCE);

            stubFormatTez = sandbox.stub(Helper, 'formatTez')
                                .withArgs(BALANCE);

            account.getBalance([BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledThrice(stubHelper);
            sinon.assert.calledOnce(stubRpcRequest);
            sinon.assert.calledOnce(spyGetBalanceAccounts);
        });
    });

    context('get-balance-without-args', async () => {
        it('should return warning', async () => { 
            const stubLoggerWarn = sandbox.stub(Logger, 'warn');

            account.getBalance([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

});