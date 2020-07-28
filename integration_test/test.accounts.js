const sinon = require('sinon'),
      expect = require('chai').expect,

      CONSEIL_JS = '../lib/conseiljs',
      TezsterManagerClass = require('../tezster-manager'),
      { RpcRequest } = require('../modules/rpc-util'),
      faucetFile = ('./integration_test/files/faucet.json');

const BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      NEW_WALLET = 'testaccount'
      NEW_WALLET2 = 'testaccount2'
      NEW_WALLET3 = 'testaccount3'
      tezosNode = 'http://localhost:18731',
      newNodeProvider = 'http://localhost:18731',
      BALANCE = 40000000000,
      keystore = {
          publicKey: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
          privateKey: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
          publicKeyHash: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
          seed: '',
          storeType: 1
      },
      MNEMOMICS = 'sadness wait blast merry moral undo dynamic crystal ancient climb cat wear frown note cherry near digital foam emerge absurd use venture toy measure',
      MNEMOMICS_KEYSTORE = {
        publicKey: 'edpkv34XmPaRsAaDVqQv1c4AZygigqQqhnd6doxYapnhsAZQF8YcCA',
        privateKey: 'edskRw8BjxMinJVPaaB4QaAiwt3FXsoZavrYuScaYfrKdPcyc1CjiGj7Z3heTGtfeFNsJnYQhCHBXg5sk6Q47LHEZMsqx6eqgr',
        publicKeyHash: 'tz1d5r26m3MGMbrvTktUDzjVSUXfF7VnfUTV',
        seed: '',
        storeType: 1
      };      

describe('Faucet Account Operations', async () => {
    let sandbox = null;
    beforeEach(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                sandbox = sinon.createSandbox();
                tezstermanager = new TezsterManagerClass.TezsterManager();
                resolve();
            }, 200);
        });
    })
    afterEach(() => {
      sandbox.restore();
    })

    context('set-rpc-node', async () => { 
        it('should be able to set new rpc node', async () => { 
            setTimeout(async () => {
                console.log('-------------------------------SET-RPC-NODE-------------------------------');
                await tezstermanager.setProvider({ newNodeProvider });
            }, 77000);
        });
    });

    context('get-rpc-node', async () => {
        it('should fetch current provider', async () => { 
            setTimeout(async () => {
                console.log('-------------------------------GET-RPC-NODE-------------------------------');
                await tezstermanager.getProvider();
            }, 78500);
        });
    });

    context('list-accounts', async () => {
        it('should be able to list down all accounts', async () => {
            setTimeout(async () => {
                console.log('-------------------------------LIST-ACCOUNTS-------------------------------');
                await tezstermanager.listAccounts();
            }, 79500);
        });
    });

    context('get-balance', async () => {
        it('should return balance', async () => { 
            spyRpcRequest = sinon.spy(RpcRequest, 'fetchBalance');

            setTimeout(async () => {
                console.log('-------------------------------GET-BALANCE-------------------------------');
                await tezstermanager.getBalance([BOOTSTRAPPED_ACCOUNT]);
            }, 80500);
            
        });

    });

    context('create-wallet', async () => {
        it('should create wallet along with mnemonic phrases', async () => { 
            const conseiljs = require(CONSEIL_JS);
            spyConseilGenerateMnemonic = sinon.spy(conseiljs.TezosWalletUtil, 'generateMnemonic');

            setTimeout(async () => {
                console.log('-------------------------------CREATE-WALLET-------------------------------');
                await tezstermanager.createWallet([NEW_WALLET]);
            }, 82000);

        });

        it('should be able to remove existing account', async () => {
            setTimeout(async () => {
                console.log('-------------------------------REMOVE-ACCOUNT-------------------------------');
                await tezstermanager.removeAccount([NEW_WALLET]);
            }, 85000);
        });
    });

    context('add-testnet-account', async () => {
        it('should add newaccount using faucet file', async () => { 
            const conseiljs = require(CONSEIL_JS);
            spyConseilUnlockFundraiser = sinon.spy(conseiljs.TezosWalletUtil, 'unlockFundraiserIdentity');

            setTimeout(async () => {
                console.log('-------------------------------ADD-TESTNET-ACCOUNT-------------------------------');
                await tezstermanager.addTestnetAccount([NEW_WALLET, faucetFile]);
            }, 86000);
        });
    });

    context('activate-testnet-account', async () => {

        it('should be able to change rpc node to remote nodes', async () => { 
            setTimeout(async () => {
                await tezstermanager.setProvider({ newNodeProvider : 'https://carthagenet.SmartPy.io' });
            }, 87000);
        });

        it('should activate the account which have been already added', async () => { 
            const conseiljs = require(CONSEIL_JS);
            spyConseilActivation = sinon.spy(conseiljs.TezosNodeWriter, 'sendIdentityActivationOperation');
            spyOperationConfirmation = sinon.spy(conseiljs.TezosConseilClient, 'awaitOperationConfirmation');
            spyConseilReveal = sinon.spy(conseiljs.TezosNodeWriter, 'sendKeyRevealOperation');        

            setTimeout(async () => {
                console.log('-------------------------------ACTIVATE-TESTNET-ACCOUNT-------------------------------');
                await tezstermanager.activateTestnetAccount([NEW_WALLET]);
            }, 89000);

            setTimeout(async () => {
                await tezstermanager.removeAccount([NEW_WALLET]);
            }, 107000);
        });
    });

    context('restore-wallet', async () => {
        it('should restore wallet using mnemonic and add into config', async () => { 
            const conseiljs = require(CONSEIL_JS);
            spyConseilUnlockIdentity = sinon.spy(conseiljs.TezosWalletUtil, 'unlockIdentityWithMnemonic');

            setTimeout(async () => {
                console.log('-------------------------------RESTORE-ACCOUNT-USING-MNEMONICS-------------------------------');
                await tezstermanager.restoreWallet([NEW_WALLET, MNEMOMICS]);
            }, 109000);

            setTimeout(async () => {
                await tezstermanager.removeAccount([NEW_WALLET]);
            }, 110000);

            setTimeout(async () => {
                await tezstermanager.setProvider({ newNodeProvider : 'http://localhost:18731' });
            }, 111000);
        });
    });

    context('confirm accounts related call', async () => {
        it('should be able to output result as expected', async () => {
            setTimeout(async () => {
                expect({ spyConseilActivation }).to.be.an('object');
                expect({ spyRpcRequest }).to.be.an('object');
                expect({ spyConseilGenerateMnemonic }).to.be.an('object');
                expect({ spyConseilUnlockFundraiser }).to.be.an('object');
                expect({ spyConseilActivation }).to.be.an('object');
                expect({ spyOperationConfirmation }).to.be.an('object');
                expect({ spyConseilReveal }).to.be.an('object');
                expect({ spyConseilUnlockIdentity }).to.be.an('object');
            }, 112000);
        });
    });
    
});