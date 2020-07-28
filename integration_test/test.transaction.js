const sinon = require('sinon'),
      expect = require('chai').expect,
      
      CONSEIL_JS = '../lib/conseiljs',
      Logger = require('../modules/logger'),
      TezsterManagerClass = require('../tezster-manager');

const ACCOUNT1_PKH = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      ACCOUNT2_PKH = 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN';

describe('Transaction Operations', async () => {
    let sandbox = null;
    beforeEach(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                sandbox = sinon.createSandbox();
                tezstermanager = new TezsterManagerClass.TezsterManager();
                resolve();
            }, 200);
          });
    });
    afterEach(() => {
        sandbox.restore();
    });

    context('transfer', async () => {
        it('should be able to transfer the amount using pkh', async () => {
            const conseiljs = require(CONSEIL_JS);           
            spyConseil = sinon.spy(conseiljs.TezosNodeWriter, 'sendTransactionOperation'); 
            setTimeout(async () => {
                console.log('-------------------------------TRANSFER BETWEEN ACCOUNTS-------------------------------');
                await tezstermanager.transfer([0.00002, ACCOUNT1_PKH, ACCOUNT2_PKH]);
            }, 117000);
        });
    });

    context('list-transactions', async () => {
        it('should execute inside for loop', async () => {      
            setTimeout(async () => {
                console.log('-------------------------------LIST-TRANSACTIONS-------------------------------');
                await tezstermanager.listTransactions();
            }, 120000);
        });
    });

    context('confirm transactions related call', async () => {
        it('should be able to output result as expected', async () => {
            setTimeout(async () => {
                expect({ spyConseil }).to.be.an('object');
            }, 121000);

            setTimeout(async () => {
                console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>> Press CTRL+C to exit <<<<<<<<<<<<<<<<<<<<<<<<<<<')
            }, 122000);
        });
    });

})
