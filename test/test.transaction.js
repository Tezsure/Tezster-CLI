const sinon = require('sinon'),
      expect = require('chai').expect,
      path = require('path'),
      jsonfile = require('jsonfile'),

      confFile = '/var/tmp/tezster/config.json',
      testconfFile = path.resolve(__dirname, './config/test-config.json'),
      testconfig = jsonfile.readFileSync(testconfFile),

      CONSEIL_JS = '../lib/conseiljs',
      Logger = require('../modules/logger'),
      { TransferOperation } = require('./responses/AccountOperations.responses'),
      TransactionClass = require('../modules/transactions/transactions');

const tezosNode = 'http://localhost:18731',
      ACCOUNT1_PKH = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      ACCOUNT2_PKH = 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
      ACCOUNT3_PKH =  'tz1gYH67853DvdzjobyfVNsAeSC6PScjf2w1',
      keystore = {
          publicKey: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
          privateKey: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
          publicKeyHash: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
          seed: '',
          storeType: 1
      };

describe('Transaction Operations', async () => {
    let sandbox = null;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox
            .stub(jsonfile, 'readFileSync')
            .withArgs(confFile)
            .returns(testconfig);
        transaction = new TransactionClass.Transactions();
    });
    afterEach(() => {
        sandbox.restore()
    });

    context('list-transactions', async () => {
        it('should execute inside for loop', async () => {
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerInfo = sandbox.stub(Logger, 'warn');
            await transaction.listTransactions();
            sinon.assert.calledOnce(stubLoggerInfo);
        });
    });

    context('transfer', async () => {
        it('should be able to transfer the amount using pkh', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubConseil = sandbox.stub(conseiljs.TezosNodeWriter, 'sendTransactionOperation')
                        .withArgs(tezosNode, keystore, ACCOUNT2_PKH, 40000000, 1500, '')
                        .returns(TransferOperation);

            stubWriteFile = sandbox.stub(jsonfile, 'writeFile')
                                    .withArgs(confFile, testconfig);

            await transaction.transfer([40, ACCOUNT1_PKH, ACCOUNT2_PKH]);
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.calledOnce(stubWriteFile);
            expect({ stubConseil }).to.be.an('object');
        });

        it('should throw error as amount is not an integer', async () => {
            stubLoggerError = sandbox.stub(Logger, 'error');
            await transaction.transfer(['ab', ACCOUNT1_PKH, ACCOUNT2_PKH]);
            sinon.assert.calledOnce(stubLoggerError); 
        });

        it(`should be able to run catch error for keystore`, async () => {
            stubLoggerError = sandbox.stub(Logger, 'error');
            await transaction.transfer([40, ACCOUNT3_PKH, ACCOUNT2_PKH]);
            sinon.assert.calledOnce(stubLoggerError); 
        });

        it('should be able to run catch error for conseiljs transfer ', async () => {
            const conseiljs = require(CONSEIL_JS);
            stubLoggerError = sandbox.stub(Logger, 'error');
            stubConseil = sandbox.stub(conseiljs.TezosNodeWriter, 'sendTransactionOperation')
                        .withArgs(tezosNode, keystore, ACCOUNT2_PKH, 40000000, 150, '')
                        .returns(TransferOperation);

            await transaction.transfer([40, ACCOUNT1_PKH, ACCOUNT2_PKH]);
            sinon.assert.calledOnce(stubLoggerError);
            expect({ stubConseil }).to.be.an('object');
        });

        it('invalid number of arguments', async () => {
            stubLoggerError = sandbox.stub(Logger, 'error');
            await transaction.transfer([]);
            sinon.assert.calledOnce(stubLoggerError); 
        });

    });

})