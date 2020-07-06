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
      { sendContractOriginationOperation, sendContractInvocationOperation, TezosContractIntrospector, TezosConseilClientGetAccount } = require('./responses/ContractOperations.responses');

const contractAbsolutePath = './michelson.tz',
      CONTRACT_ADDRESS = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM',
      CONTRACT_LABEL = 'samplecontract',
      NEW_CONTRACT_LABEL = 'newcontract',
      INCORRECT_CONTRACT_LABEL = 'notavailablecontract',
      contractLabel = 'deployedcontract',
      BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      INCORRECT_BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7hgfd45tyTw8fHG8LhKxZ12',
      initStorageValue = "\"tezsure\"",
      argumentValue = "\"tezster\"",
      account = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      amount = 0,
      fee = 100000,
      storageLimit = 10000,
      gasLimit = 500000,
      TESTNET_NAME = 'carthagenet',
      CONSEIL_SERVER_APIKEY = '04c98bd2-7cc5-49f2-9108-2d48efcbd660',
      CONSEIL_SERVER_URL = 'https://conseil-dev.cryptonomic-infra.tech',
      CONTRACT_CODE = `parameter string;
                       storage string;
                       code {CAR; NIL operation; PAIR;};`,
      FORMATTED_CONTRACT_CODE = [
        'parameter string;',
        'storage string;',
        'code { CAR ; NIL operation ; PAIR }'
      ],
      NEW_CONTRACT = {
        "label": "samplecontract",
        "pkh": "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM",
        "identity": "localnode - samplecontract"
      },
      keystore = {
          publicKey: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
          privateKey: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
          publicKeyHash: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
          seed: '',
          storeType: 1
      },
      short_keystore = {
        pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
        sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
        pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
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
                                .withArgs(contractAbsolutePath)
                                .returns(CONTRACT_CODE);

            stubKeys = sandbox
                        .stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns(short_keystore);

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractOriginationOperation')
                            .withArgs(testconfig.provider, keystore, amount, undefined,
                                      fee, '', storageLimit, gasLimit, 
                                      CONTRACT_CODE, initStorageValue, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractOriginationOperation.applied);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerError = sandbox.stub(Logger, 'error');        

            ophash = sendContractOriginationOperation.applied.results.contents[0].metadata.operation_result.originated_contracts;

            stubAddNewContract = sandbox
                                .stub(contract, 'addNewContract')
                                .withArgs(contractLabel, CONTRACT_ADDRESS, account, testconfig.provider);
                                
            await contract.deployContract({ contractLabel, contractAbsolutePath, initStorageValue, account, amount, fee, storageLimit, gasLimit });
            sinon.assert.calledOnce(stubReadFileSync);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.calledOnce(stubAddNewContract);
        });

        it('must call conseil function with failed status', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubReadFileSync = sandbox
                                .stub(fs, 'readFileSync')
                                .withArgs(contractAbsolutePath)
                                .returns(CONTRACT_CODE);

            stubKeys = sandbox
                        .stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns(short_keystore);

            stubConseil = sandbox
                        .stub(conseiljs.TezosNodeWriter, 'sendContractOriginationOperation')
                        .withArgs(testconfig.provider, keystore, amount, undefined,
                                  fee, '', storageLimit, gasLimit, 
                                  CONTRACT_CODE, initStorageValue, conseiljs.TezosParameterFormat.Michelson)
                        .returns(sendContractOriginationOperation.failed);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerError = sandbox.stub(Logger, 'error');       
            
            stubAddNewContract = sandbox
                                .stub(contract, 'addNewContract');

            await contract.deployContract({ contractLabel, contractAbsolutePath, initStorageValue, account, amount, fee, storageLimit, gasLimit });
            sinon.assert.calledOnce(stubReadFileSync);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.callCount(stubAddNewContract, 0);
        });

        it('should throw error as key is not present', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.deployContract({ contractLabel, contractAbsolutePath, initStorageValue, INCORRECT_BOOTSTRAPPED_ACCOUNT, amount, fee, storageLimit, gasLimit });
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should throw error as contract label already exists', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.deployContract({ contractLabel, contractAbsolutePath, initStorageValue, BOOTSTRAPPED_ACCOUNT, amount, fee, storageLimit, gasLimit });
            sinon.assert.calledOnce(stubLoggerError);
        });

    });

    context('invoke-contract', async () => {
        it('must call sendContractInvocationOperation function with applied status', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubHelper = sandbox.stub(Helper, 'findKeyObj')
                        .withArgs(testconfig.contracts, contractLabel)
                        .returns(NEW_CONTRACT);

            stubKeys = sandbox.stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns(short_keystore);
            const opHash = sendContractInvocationOperation.applied.operationGroupID.slice(1,sendContractInvocationOperation.applied.operationGroupID.length-2);

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractInvocationOperation')
                            .withArgs(testconfig.provider, keystore, CONTRACT_ADDRESS, amount,
                                      fee, '', storageLimit, 501664, undefined,
                                      argumentValue, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractInvocationOperation.applied);

            stubAddTransaction = sandbox
                                .stub(contract, 'addTransaction')
                                .withArgs('contract-call', opHash, keystore.publicKeyHash, CONTRACT_LABEL, 0);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            
            await contract.callContract({ contractLabel, argumentValue, account, amount, fee, storageLimit, gasLimit });
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubKeys);
            sinon.assert.calledOnce(stubConseil);
        });

        it('must call sendContractInvocationOperation function with failed status', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubHelper = sandbox.stub(Helper, 'findKeyObj')
                        .withArgs(testconfig.contracts, contractLabel)
                        .returns(NEW_CONTRACT);

            stubKeys = sandbox.stub(contract, 'getKeys')
                        .withArgs(BOOTSTRAPPED_ACCOUNT)
                        .returns(short_keystore);
            const opHash = sendContractInvocationOperation.applied.operationGroupID.slice(1,sendContractInvocationOperation.applied.operationGroupID.length-2);

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeWriter, 'sendContractInvocationOperation')
                            .withArgs(testconfig.provider, keystore, CONTRACT_ADDRESS, amount,
                                      fee, '', storageLimit, 501664, undefined,
                                      argumentValue, conseiljs.TezosParameterFormat.Michelson)
                            .returns(sendContractInvocationOperation.failed);

            stubAddTransaction = sandbox
                                .stub(contract, 'addTransaction')
                                .withArgs('contract-call', opHash, keystore.publicKeyHash, CONTRACT_LABEL, 0);

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            
            await contract.callContract({ contractLabel, argumentValue, account, amount, fee, storageLimit, gasLimit });
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubKeys);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should throw error as key is not present', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.callContract({ contractLabel, argumentValue, INCORRECT_BOOTSTRAPPED_ACCOUNT, amount, fee, storageLimit, gasLimit });
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should throw error as contract label is not present', async () => {
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerError = sandbox.stub(Logger, 'error');
            await contract.callContract({ contractLabel, argumentValue, account, fee, storageLimit, gasLimit });
            sinon.assert.calledOnce(stubLoggerError);
        });

    });

    context('get-storage', async () => {
        it('must call getContractStorage function', async () => {
            const conseiljs = require(CONSEIL_JS);

            stubHelper = sandbox
                        .stub(Helper, 'findKeyObj')
                        .withArgs(testconfig.contracts, CONTRACT_LABEL)
                        .returns(NEW_CONTRACT);

            stubConseil = sandbox
                            .stub(conseiljs.TezosNodeReader, 'getContractStorage')
                            .withArgs(testconfig.provider, CONTRACT_ADDRESS);

            sandbox.stub(Logger, 'info');

            await contract.getStorage([CONTRACT_LABEL]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubConseil);
        });

        it('should be able to catch error', async () => {
            const conseiljs = require(CONSEIL_JS);

            stubHelper = sandbox
                        .stub(Helper, 'findKeyObj')
                        .withArgs(testconfig.contracts, CONTRACT_LABEL)
                        .returns(NEW_CONTRACT);

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
            sinon.assert.calledOnce(stubLoggerError);CONTRACT_ADDRESS
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
                                .withArgs(contractAbsolutePath)
                                .returns(true);

            stubHelper = sandbox
                        .stub(fs, 'readFileSync')
                        .withArgs(contractAbsolutePath, 'utf8')
                        .returns(CONTRACT_CODE);

            stubConseilEntryPoint = sandbox
                                    .stub(conseiljs.TezosContractIntrospector, 'generateEntryPointsFromCode')
                                    .withArgs(CONTRACT_CODE)
                                    .returns(TezosContractIntrospector);

            stubConseilStorageFormat = sandbox
                                        .stub(conseiljs.TezosLanguageUtil, 'preProcessMichelsonScript')
                                        .withArgs(CONTRACT_CODE)
                                        .returns(FORMATTED_CONTRACT_CODE);

            stubLoggerInfo = sandbox.stub(Logger, 'info');

            await contract.getEntryPoints([contractAbsolutePath]);
            sinon.assert.calledOnce(stubFileExistsSync);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubConseilEntryPoint);
            sinon.assert.calledOnce(stubConseilStorageFormat);
        });

        it('list entry points using contract addresss', async () => {
            const conseiljs = require(CONSEIL_JS);
            let conseilServer = { 'url': CONSEIL_SERVER_URL, 'apiKey': CONSEIL_SERVER_APIKEY, 'network': TESTNET_NAME };

            stubHelper = sandbox
                        .stub(conseiljs.TezosConseilClient, 'getAccount')
                        .withArgs(conseilServer, conseilServer.network, CONTRACT_ADDRESS)
                        .returns(TezosConseilClientGetAccount);

            stubConseilEntryPoint = sandbox
                        .stub(conseiljs.TezosContractIntrospector, 'generateEntryPointsFromCode')
                        .withArgs(CONTRACT_CODE)
                        .returns(TezosContractIntrospector);

            stubLoggerInfo = sandbox.stub(Logger, 'info');

            await contract.getEntryPoints([CONTRACT_ADDRESS]);
            sinon.assert.calledOnce(stubHelper);
            sinon.assert.calledOnce(stubConseilEntryPoint);
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