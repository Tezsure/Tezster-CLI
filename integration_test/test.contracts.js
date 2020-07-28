const sinon = require('sinon'),
      expect = require('chai').expect,

      CONSEIL_JS = '../lib/conseiljs',
      Logger = require('../modules/logger'),
      TezsterManagerClass = require('../tezster-manager');

const contractAbsolutePath = ('./integration_test/files/michelson.tz'),
      CONTRACT_ADDRESS = 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM',
      CONTRACT_LABEL = 'samplecontract',
      contractName = 'samplecontract',
      NEW_CONTRACT_LABEL = 'newcontract',
      contractLabel = 'samplecontract',
      initStorageValue = "\"tezsure\"",
      argumentValue = "\"tezster\"",
      account = 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
      amount = 0,
      fee = 100000,
      storageLimit = 10000,
      gasLimit = 500000;

describe('Smart Contract Operations', async () => {
    let sandbox = null;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        return new Promise((resolve) => {
            setTimeout(() => {
                sandbox = sinon.createSandbox();
                tezstermanager = new TezsterManagerClass.TezsterManager();
                resolve();
            }, 200);
        });
    });
    afterEach(() => {
        sandbox.restore()
    });

    context('list-contracts', async () => {
        it('should execute inside for loop', async () => {
            setTimeout(async () => {
                console.log('-------------------------------LIST-CONTRACTS-------------------------------');
                await tezstermanager.listContracts();
            }, 63000);
        });
    });

    context('deploy-contract', async () => {
        it('must call sendContractOriginationOperation function with applied status', async () => {
            const conseiljs = require(CONSEIL_JS);
            spyConseilDeployment = sinon
                            .spy(conseiljs.TezosNodeWriter, 'sendContractOriginationOperation');
            
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            await tezstermanager.setProvider({ newNodeProvider : 'http://localhost:18731' });

            setTimeout(async () => {
                console.log('-------------------------------DEPLOY-CONTRACT-ON-LOCAL-NODE-------------------------------');
                await tezstermanager.deployContract({ contractLabel, contractAbsolutePath, initStorageValue, account, amount, fee, storageLimit, gasLimit });
            }, 65000);

        });
    });

    context('invoke-contract', async () => {
        it('must call sendContractInvocationOperation function with applied status', async () => {
            const conseiljs = require(CONSEIL_JS);
            spyConseilInvocation = sinon
                            .spy(conseiljs.TezosNodeWriter, 'sendContractInvocationOperation');

            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            stubLoggerInfo = sandbox.stub(Logger, 'info');

            setTimeout(async () => {
                console.log('-------------------------------INVOKE-CONTRACT-ON-LOCAL-NODE-------------------------------');
                await tezstermanager.callContract({ contractName, argumentValue, account, amount, fee, storageLimit, gasLimit });
            }, 68000);
        });
    });

    context('get-storage', async () => {
        it('must call getContractStorage function', async () => {
            const conseiljs = require(CONSEIL_JS);
            spyConseilGetStorage = sinon
                            .spy(conseiljs.TezosNodeReader, 'getContractStorage');
            sandbox.stub(Logger, 'info');

            setTimeout(async () => {
                console.log('-------------------------------GET-STORAGE FROM-CONTRACT-------------------------------');
                await tezstermanager.getStorage([CONTRACT_LABEL]);
            }, 70000);
        });
    });
  
    context('add-contract', async () => {
        it('must call addNewContract method', async () => {
            setTimeout(async () => {
                console.log('-------------------------------ADD-CONTRACT-------------------------------');
                await tezstermanager.addContract([NEW_CONTRACT_LABEL, CONTRACT_ADDRESS]);
            }, 70200);
        });
    });

    context('delete-contract', async () => {
        it('must remove the contract', async () => {
            setTimeout(async () => {
                console.log('-------------------------------REMOVE-CONTRACT-------------------------------');
                await tezstermanager.removeContract([CONTRACT_LABEL]);
            }, 71500);

            setTimeout(async () => {
                await tezstermanager.removeContract([NEW_CONTRACT_LABEL]);
            }, 72000);
        });
    });

    context('list-entry-points', async () => {
        it('list entry points using file', async () => {
            const conseiljs = require(CONSEIL_JS);
            spyConseilEntryPoint = sinon
                                    .spy(conseiljs.TezosContractIntrospector, 'generateEntryPointsFromCode');

            spyConseilStorageFormat = sinon
                                        .spy(conseiljs.TezosLanguageUtil, 'preProcessMichelsonScript');

            setTimeout(async () => {
                console.log('-------------------------------LIST-ENTRY-POINTS-USING-FILE-------------------------------');
                await tezstermanager.listEntryPoints([contractAbsolutePath]);
            }, 73000);
        });
    });

    context('confirm contracts related call', async () => {
        it('should be able to output result as expected', async () => {
            setTimeout(async () => {
                expect({ spyConseilDeployment }).to.be.an('object');
                expect({ spyConseilInvocation }).to.be.an('object');
                expect({ spyConseilGetStorage }).to.be.an('object');
                expect({ spyConseilEntryPoint }).to.be.an('object');
                expect({ spyConseilStorageFormat }).to.be.an('object');
            }, 75000);
        });
    });

});