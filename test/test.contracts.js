const sinon = require('sinon'),
      fs = require('fs'),
      path = require('path'),
      jsonfile = require('jsonfile'),

      confFile = '/var/tmp/tezster/config.json',
      testconfFile = path.resolve(__dirname, './config/test-config.json'),
      testconfig = jsonfile.readFileSync(testconfFile),

      CONSEIL_JS = '../lib/conseiljs',
      Logger = require('../modules/logger'),
      { Helper } = require('../modules/helper'),
      ContractClass = require('../modules/contract/contracts'),
      
      { sendContractOriginationOperation, sendContractInvocationOperation, TezosContractIntrospector } = require('./responses/ContractOperations.responses');

const tezosNode = 'http://localhost:18731',
      CONTRACT_ADDRESS = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM',
      CONTRACT_LABEL = 'samplecontract',
      NEW_CONTRACT_LABEL = 'newcontract',
      INCORRECT_CONTRACT_LABEL = 'notavailablecontract',
      CONTRACT_DEPLOY_LABEL = 'deployedcontract',
      BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      INCORRECT_BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7hgfd45tyTw8fHG8LhKxZ12',
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
        sandbox
            .stub(jsonfile, 'readFileSync')
            .withArgs(confFile)
            .returns(testconfig);
        contract = new ContractClass.Contracts();
    });
    afterEach(() => {
        sandbox.restore()
    });

    context('deploy-contract', async () => {
        it('must call sendContractOriginationOperation function with applied status', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubReadFileSync = sandbox
                                .stub(fs, 'readFileSync')
                                .withArgs('./MichelsonCodeFile.tz')
                                .returns(CONTRACT_CODE);

            stubKeys = sandbox
                        .stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns({
                            pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
                            sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
                            pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
                            seed: '',
                            storeType: 1
                        });

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractOriginationOperation')
                            .withArgs(testconfig.provider, keystore, 0, undefined,
                                      100000, '', 10000, 500000, 
                                      CONTRACT_CODE, CONTRACT_INITIAL_STORAGE, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractOriginationOperation.applied);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerError = sandbox.stub(Logger, 'error');        

            ophash = sendContractOriginationOperation.applied.results.contents[0].metadata.operation_result.originated_contracts;

            stubAddNewContract = sandbox
                                .stub(contract, 'addNewContract')
                                .withArgs(CONTRACT_DEPLOY_LABEL, CONTRACT_ADDRESS, BOOTSTRAPPED_ACCOUNT, testconfig.provider);
                                
            await contract.deployContract([CONTRACT_DEPLOY_LABEL, './MichelsonCodeFile.tz', CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubReadFileSync);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.calledOnce(stubAddNewContract);
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
                        .returns({
                            pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
                            sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
                            pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
                            seed: '',
                            storeType: 1
                        });

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractOriginationOperation')
                            .withArgs(testconfig.provider, keystore, 0, undefined,
                                      100000, '', 10000, 500000, 
                                      CONTRACT_CODE, CONTRACT_INITIAL_STORAGE, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractOriginationOperation.failed);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerError = sandbox.stub(Logger, 'error');       
            
            stubAddNewContract = sandbox
                                .stub(contract, 'addNewContract');

            await contract.deployContract([CONTRACT_DEPLOY_LABEL, './MichelsonCodeFile.tz', CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubReadFileSync);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.callCount(stubAddNewContract, 0);
        });

        it('should throw error as key is not present', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.deployContract([CONTRACT_DEPLOY_LABEL, './MichelsonCodeFile.tz', CONTRACT_INITIAL_STORAGE, INCORRECT_BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should throw error as contract label already exists', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.deployContract([CONTRACT_LABEL, './MichelsonCodeFile.tz', CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await contract.deployContract([CONTRACT_LABEL, CONTRACT_INITIAL_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('invoke-contract', async () => {
        it('must call sendContractInvocationOperation function with applied status', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubHelper = sandbox.stub(Helper, 'findKeyObj')
                        .withArgs(testconfig.contracts, CONTRACT_LABEL)
                        .returns({
                            "label": "samplecontract",
                            "pkh": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
                            "identity": "localnode - samplecontract"
                            });

            stubKeys = sandbox.stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns({
                            pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
                            sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
                            pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
                            seed: '',
                            storeType: 1
                        });
            const opHash = sendContractInvocationOperation.applied.operationGroupID.slice(1,sendContractInvocationOperation.applied.operationGroupID.length-2);

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractInvocationOperation')
                            .withArgs(testconfig.provider, keystore, CONTRACT_ADDRESS, 0,
                                      100000, '', 10000, 100000, undefined,
                                      CONTRACT_INVOCATION_STORAGE, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractInvocationOperation.applied);

            stubAddTransaction = sandbox
                                .stub(contract, 'addTransaction')
                                .withArgs('contract-call', opHash, keystore.publicKeyHash, CONTRACT_LABEL, 0);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            
            await contract.callContract([CONTRACT_LABEL, CONTRACT_INVOCATION_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubKeys);
            sinon.assert.calledOnce(stubConseil);
        });

        it('should throw error as key is not present', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.callContract([CONTRACT_LABEL, CONTRACT_INVOCATION_STORAGE, INCORRECT_BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should throw error as contract label is not present', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.callContract([INCORRECT_CONTRACT_LABEL, CONTRACT_INVOCATION_STORAGE, BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await contract.callContract([CONTRACT_LABEL, CONTRACT_INITIAL_STORAGE]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('get-storage', async () => {
        it('must call getContractStorage function', async () => {
            const conseiljs = require(CONSEIL_JS);

            stubHelper = sandbox
                        .stub(Helper, 'findKeyObj')
                        .withArgs(testconfig.contracts, CONTRACT_LABEL)
                        .returns({
                            "label": "samplecontract",
                            "pkh": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
                            "identity": "localnode - samplecontract"
                            });

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeReader, 'getContractStorage')
                            .withArgs(testconfig.provider, CONTRACT_ADDRESS);

            sandbox.stub(Logger, 'info');

            await contract.getStorage([CONTRACT_LABEL]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubConseil);
        });

        it('should throw error as contract label is not present', async () => {
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.getStorage([INCORRECT_CONTRACT_LABEL]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => { 
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await contract.getStorage([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });
  
    context('add-contract', async () => {
        it('must call addNewContract method', async () => {

            stubAddNewContract = sandbox
                                .stub(contract, 'addNewContract')
                                .withArgs(NEW_CONTRACT_LABEL, CONTRACT_ADDRESS, '', testconfig.provider);

            sandbox.stub(Logger, 'info');
            await contract.addContract([NEW_CONTRACT_LABEL, CONTRACT_ADDRESS]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubAddNewContract);
        });

        it('should throw error as contract label is not present', async () => {
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.addContract([CONTRACT_LABEL, CONTRACT_ADDRESS]);
            sinon.assert.calledOnce(stubLoggerError);
        });
    
        it('must throw warning', async () => {
            stubLoggerWarn =  sandbox.stub(Logger, 'warn');
            await contract.addContract([CONTRACT_LABEL]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('delete-contract', async () => {
        it('must splice the contract from config', async () => {
            const stubHelper = sandbox
                            .stub(Helper, 'findKeyObj')
                            .withArgs(testconfig.contracts, CONTRACT_LABEL)
                            .returns(CONTRACT_ADDRESS);
            const stubLoggerInfo =  sandbox.stub(Logger, 'info');
            const stubSplice =  sandbox.stub(testconfig.contracts, 'splice');
            const stubWriteFile =  sandbox
                                    .stub(jsonfile, 'writeFile')
                                    .withArgs(confFile, testconfig);

            await contract.removeContract([CONTRACT_LABEL]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(stubSplice);
            sinon.assert.calledOnce(stubWriteFile);
        });

        it('should throw error as contract label is not present', async () => {
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.removeContract([INCORRECT_CONTRACT_LABEL]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => {
            const stubLoggerWarn =  sandbox.stub(Logger, 'warn');
            await contract.removeContract([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('list-contracts', async () => {
        it('should execute inside for loop', async () => {
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            await contract.listContracts();
            sinon.assert.calledOnce(stubLoggerInfo);
        });
    });

    context('list-entry-points', async () => {
        it('list entry points using file', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubFileExistsSync = sandbox
                                .stub(fs, 'existsSync')
                                .withArgs('./contractFile.tz')
                                .returns(true);

            stubHelper = sandbox
                        .stub(fs, 'readFileSync')
                        .withArgs('./contractFile.tz', 'utf8')
                        .returns(CONTRACT_CODE);

            stubConseilEntryPoint = sandbox
                                    .stub(conseiljs.TezosContractIntrospector, 'generateEntryPointsFromCode')
                                    .withArgs(CONTRACT_CODE)
                                    .returns(TezosContractIntrospector);

            stubConseilStorageFormat = sandbox
                                        .stub(conseiljs.TezosLanguageUtil, 'preProcessMichelsonScript')
                                        .withArgs(CONTRACT_CODE)
                                        .returns([
                                            'parameter string;',
                                            'storage string;',
                                            'code {CAR; NIL operation; PAIR;};'
                                        ]);

            stubLoggerInfo = sandbox.stub(Logger, 'info');

            await contract.getEntryPoints(['./contractFile.tz']);
            sinon.assert.calledOnce(stubFileExistsSync);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubConseilEntryPoint);
            sinon.assert.calledOnce(stubConseilStorageFormat);
        });

        it(`should throw error as contract path/address doesn't exist`, async () => {
            const stubLoggerError =  sandbox.stub(Logger, 'error');
            await contract.getEntryPoints(['temp.tz']);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => {
            const stubLoggerWarn =  sandbox.stub(Logger, 'warn');
            await contract.getEntryPoints([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

});