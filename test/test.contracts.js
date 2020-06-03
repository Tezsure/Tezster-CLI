const chai = require("chai"),
      sinon = require("sinon"),
      expect = chai.expect,
      { assert } = require('chai'),
      fs = require('fs'),
      path = require('path'),
      jsonfile = require('jsonfile'),

      confFile = '/tmp/tezster/config.json',
      config = jsonfile.readFileSync(confFile),

      CONSEIL_JS = '../lib/conseiljs',
      Logger = require('../modules/logger'),
      { Helper } = require('../modules/helper'),
      ContractClass = require('../modules/contract/contracts'),
      contract = new ContractClass.Contracts(),
      { sendContractOriginationOperation, sendContractInvocationOperation } = require('./TezosOperations.responses');

const CONTRACT_ADDRESS = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM',
      CONTRACT_LABEL = 'samplecontract',
      BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      CONTRACT_INITIAL_STORAGE = "\"tezsure\"",
      CONTRACT_INVOCATION_STORAGE = "\"tezster\"",
      CONTRACT_CODE = `parameter string;
                       storage string;
                       code {CAR; NIL operation; PAIR;};`,
      keystore = {
          publicKey: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
          privateKey: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
          publicKeyHash: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
          seed: '',
          storeType: 1
      };

describe('Smart Contract Operations', async () => {
    let sandbox = null;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    })
    afterEach(() => {
      sandbox.restore()
    })

    context('deploy-contract-with-args', async () => {
        it('must call sendContractOriginationOperation function with applied status', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubReadFileSync = sandbox
                                .stub(fs, 'readFileSync')
                                .withArgs('./MichelsonCodeFile.tz')
                                .returns(CONTRACT_CODE);

            stubKeys = sandbox
                        .stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns( {
                            pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
                            sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
                            pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
                            seed: '',
                            storeType: 1
                        });

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractOriginationOperation')
                            .withArgs(config.provider, keystore, 0, undefined,
                                      100000, '', 10000, 500000, 
                                      CONTRACT_CODE, CONTRACT_INITIAL_STORAGE, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractOriginationOperation.applied);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerError = sandbox.stub(Logger, 'error');        

            ophash = sendContractOriginationOperation.applied.results.contents[0].metadata.operation_result.originated_contracts;

            stubAddNewContract = sandbox
                                .stub(contract, 'addNewContract')
                                .withArgs(CONTRACT_LABEL, CONTRACT_ADDRESS, BOOTSTRAPPED_ACCOUNT, config.provider);

            contract.deployContract([CONTRACT_LABEL, './MichelsonCodeFile.tz', CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubReadFileSync);
            sinon.assert.calledOnce(stubConseil);
        });

        it('must call conseil function with failed status', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubReadFileSync = sandbox
                                .stub(fs, 'readFileSync')
                                .withArgs('./MichelsonCodeFile.tz')
                                .returns(CONTRACT_CODE);

            stubKeys = sandbox
                        .stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns( {
                            pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
                            sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
                            pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
                            seed: '',
                            storeType: 1
                        });

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractOriginationOperation')
                            .withArgs(config.provider, keystore, 0, undefined,
                                      100000, '', 10000, 500000, 
                                      CONTRACT_CODE, CONTRACT_INITIAL_STORAGE, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractOriginationOperation.failed);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerError = sandbox.stub(Logger, 'error');       
            
            stubAddNewContract = sandbox
                                .stub(contract, 'addNewContract');

            contract.deployContract([CONTRACT_LABEL, './MichelsonCodeFile.tz', CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubReadFileSync);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.callCount(stubAddNewContract, 0);
        });
    });

    context('deploy-contract-without-args', async () => {
        it('must throw warning', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            contract.deployContract([CONTRACT_LABEL, CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('invoke-contract-with-args', async () => {
        it('must call sendContractInvocationOperation function with applied status', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubHelper = sandbox
                        .stub(Helper, 'findKeyObj')
                        .withArgs(config.contracts, CONTRACT_LABEL)
                        .returns({
                            "label": "samplecontract",
                            "pkh": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
                            "identity": "localnode - samplecontract"
                            });

            stubKeys = sandbox
                        .stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns( {
                            pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
                            sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
                            pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
                            seed: '',
                            storeType: 1
                        });
            const opHash = sendContractInvocationOperation.applied.operationGroupID.slice(1,sendContractInvocationOperation.applied.operationGroupID.length-2);

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractInvocationOperation')
                            .withArgs(config.provider, keystore, CONTRACT_ADDRESS, 0,
                                      100000, '', 10000, 100000, undefined,
                                      CONTRACT_INVOCATION_STORAGE, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractInvocationOperation.applied);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerError = sandbox.stub(Logger, 'error');        
            
            contract.callContract([CONTRACT_LABEL, CONTRACT_INVOCATION_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubKeys);
            sinon.assert.calledOnce(stubConseil);
        });
    });

    context('get-storage-with-args', async () => {
        it('must call getContractStorage function', async () => {
            const conseiljs = require(CONSEIL_JS);

            stubHelper = sandbox
                        .stub(Helper, 'findKeyObj')
                        .withArgs(config.contracts, CONTRACT_LABEL)
                        .returns({
                            "label": "samplecontract",
                            "pkh": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
                            "identity": "localnode - samplecontract"
                            });

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeReader, 'getContractStorage')
                            .withArgs(config.provider, CONTRACT_ADDRESS);

            sandbox.stub(Logger, 'info');

            contract.getStorage([CONTRACT_LABEL]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubConseil);
        });
    });

    context('get-storage-without-args', async () => {
        it('must throw warning', async () => { 
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            contract.getStorage([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });
  
    context('add-contract-with-args', async () => {
        it('must call addNewContract method', async () => {
            stubHelper = sandbox
                        .stub(Helper, 'findKeyObj')
                        .withArgs(config.contracts, CONTRACT_LABEL)
                        .returns();

            stubAddNewContract = sandbox
                                .stub(contract, 'addNewContract')
                                .withArgs(CONTRACT_LABEL, CONTRACT_ADDRESS, '', config.provider);

            sandbox.stub(Logger, 'info');
            contract.addContract([CONTRACT_LABEL, CONTRACT_ADDRESS]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubAddNewContract);
        });
    });

    context('add-contract-without-args', async () => {
        it('must throw warning', async () => {
            stubLoggerWarn =  sandbox.stub(Logger, 'warn');
            contract.addContract([CONTRACT_LABEL]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

});