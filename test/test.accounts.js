const sinon = require("sinon"),
      fs = require('fs'),
      path = require('path'),
      jsonfile = require('jsonfile'),
      { RpcRequest } = require('../modules/rpc-util'),

      confFile = '/var/tmp/tezster/config.json',
      testconfFile = path.resolve(__dirname, './config/test-config.json'),
      testconfig = jsonfile.readFileSync(testconfFile),

      CONSEIL_JS = '../lib/conseiljs',
      Logger = require('../modules/logger'),
      { Helper } = require('../modules/helper'),
      AccountClass = require('../modules/accounts/accounts'),
      faucetFile = require('./responses/faucet'),
      { ActivationOperation, RevealOperation } = require('./responses/AccountOperations.responses');

const BOOTSTRAPPED_ACCOUNT = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      NON_BOOTSTRAPPED_ACCOUNT = 'tz1d5r26m3MGMbrvTktUDzjVSUXfF7VnfUTV',
      NON_EXISTING_ACCOUNT = 'tz1g8r26m3Mse45vTktUDzjVSUXfF7uHGrE',
      NEW_WALLET = 'testaccount'
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
      MNEMOMICS = 'nice news screen acoustic common kid grunt polar enrich fee swift title cradle cannon target trial embody swamp sell sound shed jungle crash shaft',
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
        sandbox = sinon.createSandbox();
        sandbox
            .stub(jsonfile, 'readFileSync')
            .withArgs(confFile)
            .returns(testconfig);
        account = new AccountClass.Accounts();
    })
    afterEach(() => {
      sandbox.restore();
    })

    context('set-provider', async () => { 
        it('should call method and replace current provider', async () => { 
            spySetProviderAccounts = sinon.spy(account, 'setProviderAccounts');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            const stubWriteFile = sandbox.stub(jsonfile, 'writeFile')
                                        .withArgs(confFile, testconfig);

            await account.setProvider({ newNodeProvider });
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(spySetProviderAccounts);
            sinon.assert.calledOnce(stubWriteFile);
        });

        it('should be able to set provider on windows system', async () => { 
            spySetProviderAccounts = sinon.spy(account, 'setProviderAccounts');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            const stubWriteFile = sandbox.stub(jsonfile, 'writeFile')
                                        .withArgs(confFile, testconfig);

            const stubHelper = sandbox.stub(Helper, 'isWindows')
                                      .returns(true);

            await account.setProvider({ newNodeProvider });
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(spySetProviderAccounts);
            sinon.assert.calledOnce(stubWriteFile);
            sinon.assert.calledOnce(stubHelper);
        });

        // it('invalid number of arguments', async () => { 
        //     stubLoggerWarn = sandbox.stub(Logger, 'warn');
        //     await account.setProvider();
        //     sinon.assert.calledOnce(stubLoggerWarn);
        // });
    });

    context('get-provider', async () => {
        it('should fetch current provider', async () => { 
            spyGetProviderAccounts = sinon.spy(account, 'getProviderAccounts');
            stubLoggerInfo = sandbox.stub(Logger, 'info');

            await account.getProvider();
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(spyGetProviderAccounts);
        });
    });

    context('list-accounts', async () => {
        it('should be able to list down all accounts', async () => {
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            await account.listAccounts();
            sinon.assert.called(stubLoggerInfo);
        });
    });

    context('delete-accounts', async () => {
        it('should not splice the bootstrapped account', async () => {
            stubLoggerError =  sandbox.stub(Logger, 'error');
            await account.removeAccount([BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });
    

        it('should not able to find the key', async () => {
            stubLoggerError =  sandbox.stub(Logger, 'error');
            await account.removeAccount(['tz1']);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should be able to remove the account from config', async () => {
            stubLoggerInfo =  sandbox.stub(Logger, 'info');
            stubAccountSplice =  sandbox.stub(testconfig.accounts, 'splice');
            stubIdentitySplice =  sandbox.stub(testconfig.identities, 'splice');
            stubWriteFile =  sandbox
                            .stub(jsonfile, 'writeFile')
                            .withArgs(confFile, testconfig);

            await account.removeAccount([NON_BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(stubAccountSplice);
            sinon.assert.calledOnce(stubIdentitySplice);
            sinon.assert.calledOnce(stubWriteFile);
        });

        it('invalid number of arguments', async () => {
            const stubLoggerWarn =  sandbox.stub(Logger, 'warn');
            await account.removeAccount([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('get-balance', async () => {
        it('should return balance', async () => { 
            spyGetBalanceAccounts = sinon.spy(account, 'getBalanceAccounts');
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            
            stubRpcRequest = sandbox.stub(RpcRequest, 'fetchBalance')
                                .withArgs(testconfig.provider, BOOTSTRAPPED_ACCOUNT)
                                .returns(BALANCE);

            stubFormatTez = sandbox.stub(Helper, 'formatTez')
                                .withArgs(BALANCE);

            await account.getBalance([BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubRpcRequest);
            sinon.assert.calledOnce(spyGetBalanceAccounts);
            sinon.assert.calledOnce(stubFormatTez);
        });

        it('should throw error as invalid account', async () => { 
            stubLoggerError = sandbox.stub(Logger, 'error');
            await account.getBalance([NON_EXISTING_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => { 
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await account.getBalance([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('create-wallet', async () => {
        it('should create wallet along with mnemonic phrases', async () => { 
            const conseiljs = require(CONSEIL_JS);
            stubConseilMnemonic = sandbox.stub(conseiljs.TezosWalletUtil, 'generateMnemonic')
                                    .returns(MNEMOMICS);

            stubConseilKeystore = sandbox.stub(conseiljs.TezosWalletUtil, 'unlockIdentityWithMnemonic')
                                .withArgs(MNEMOMICS, '')
                                .returns(MNEMOMICS_KEYSTORE);

            stubAddIdentity = sandbox.stub(account, 'addIdentity')
                                .withArgs(NEW_WALLET, MNEMOMICS_KEYSTORE.privateKey, MNEMOMICS_KEYSTORE.publicKey, MNEMOMICS_KEYSTORE.publicKeyHash, '');
                    
            stubAddAccount = sandbox.stub(account, 'addAccount')
                                .withArgs(NEW_WALLET, MNEMOMICS_KEYSTORE.publicKeyHash, NEW_WALLET, testconfig.provider);

            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerWarn = sandbox.stub(Logger, 'warn');

            await account.createWallet([NEW_WALLET]);
            sinon.assert.calledOnce(stubConseilMnemonic);
            sinon.assert.calledOnce(stubConseilKeystore);
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(stubLoggerWarn);
        });

        it('should catch error via conseiljs function', async () => { 
            const conseiljs = require(CONSEIL_JS);
            stubConseilMnemonic = sandbox.stub(conseiljs.TezosWalletUtil, 'generateMnemonic')
                                    .returns(MNEMOMICS);

            stubConseilKeystore = sandbox.stub(conseiljs.TezosWalletUtil, 'unlockIdentityWithMnemonic')
                                .withArgs(MNEMOMICS, 'toThrowError')
                                .returns(MNEMOMICS_KEYSTORE);

            stubLoggerError = sandbox.stub(Logger, 'error');

            await account.createWallet([NEW_WALLET]);
            sinon.assert.calledOnce(stubConseilMnemonic);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should throw error as account already exists', async () => { 
            stubLoggerError = sandbox.stub(Logger, 'error');
            await account.createWallet([BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => { 
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await account.createWallet([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('add-testnet-account', async () => {
        it('should add newaccount using faucet file', async () => { 
            const conseiljs = require(CONSEIL_JS);
            stubReadFileSync = sandbox
                                .stub(fs, 'readFileSync')
                                .withArgs('./faucet.json', 'utf8')
                                .returns(faucetFile);

            stubConseil = sandbox.stub(conseiljs.TezosWalletUtil, 'unlockFundraiserIdentity')
                                .withArgs(JSON.parse(faucetFile).mnemonic.join(' '), JSON.parse(faucetFile).email, JSON.parse(faucetFile).password, JSON.parse(faucetFile).pkh)
                                .returns(MNEMOMICS_KEYSTORE);
                                
            stubAddIdentity = sandbox.stub(account, 'addIdentity')
                                .withArgs(NEW_WALLET, MNEMOMICS_KEYSTORE.privateKey, MNEMOMICS_KEYSTORE.publicKey, MNEMOMICS_KEYSTORE.publicKeyHash, JSON.parse(faucetFile).secret);
                    
            stubAddAccount = sandbox.stub(account, 'addAccount')
                                .withArgs(NEW_WALLET, MNEMOMICS_KEYSTORE.publicKeyHash, NEW_WALLET, testconfig.provider);

            stubLoggerInfo = sandbox.stub(Logger, 'info');

            await account.addTestnetAccount([NEW_WALLET, './faucet.json']);
            sinon.assert.calledOnce(stubReadFileSync);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.calledOnce(stubLoggerInfo);
        });

        it('should trigger error as empty JSON file', async () => { 
            stubReadFileSync = sandbox
                                .stub(fs, 'readFileSync')
                                .withArgs('./faucet.json', 'utf8')
                                .returns();

            stubLoggerError = sandbox.stub(Logger, 'error');

            await account.addTestnetAccount([NEW_WALLET, './faucet.json']);
            sinon.assert.calledOnce(stubReadFileSync);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should return error as keys already exist', async () => { 
            stubLoggerError = sandbox.stub(Logger, 'error');
            await account.addTestnetAccount([BOOTSTRAPPED_ACCOUNT, '.faucet.json']);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => { 
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await account.addTestnetAccount([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('activate-testnet-account', async () => {
        it('should activate the account which have been already added', async () => { 
            const conseiljs = require(CONSEIL_JS);

            stubNodeProvider = sandbox.stub(Helper, 'confirmNodeProvider')
                                .withArgs(tezosNode)
                                .returns(false);

            stubConseilActivation = sandbox.stub(conseiljs.TezosNodeWriter, 'sendIdentityActivationOperation')
                                    .withArgs(tezosNode, MNEMOMICS_KEYSTORE, JSON.parse(faucetFile).secret)
                                    .returns(ActivationOperation);

            stubOperationConfirmation = sandbox.stub(conseiljs.TezosConseilClient, 'awaitOperationConfirmation');

            stubConseilReveal = sandbox.stub(conseiljs.TezosNodeWriter, 'sendKeyRevealOperation')
                                .withArgs(tezosNode, MNEMOMICS_KEYSTORE)
                                .returns(RevealOperation);
        
            stubLoggerInfo = sandbox.stub(Logger, 'info');
            stubLoggerWarn = sandbox.stub(Logger, 'warn');

            await account.activateTestnetAccount([NON_BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubNodeProvider);
            sinon.assert.calledOnce(stubConseilActivation);
            sinon.assert.calledOnce(stubOperationConfirmation);
            sinon.assert.calledOnce(stubConseilReveal);
            sinon.assert.calledOnce(stubLoggerInfo);
        });

        it('should be able to catch error in operation confirmation hook', async () => { 
            const conseiljs = require(CONSEIL_JS);

            stubNodeProvider = sandbox.stub(Helper, 'confirmNodeProvider')
                                .withArgs(tezosNode)
                                .returns(false);

            stubConseilActivation = sandbox.stub(conseiljs.TezosNodeWriter, 'sendIdentityActivationOperation')
                                    .withArgs(tezosNode, keystore, JSON.parse(faucetFile).secret)
                                    .returns(ActivationOperation);
        
            stubLoggerError = sandbox.stub(Logger, 'error');
            stubLoggerWarn = sandbox.stub(Logger, 'warn');

            await account.activateTestnetAccount([NON_BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledTwice(stubLoggerError);
        });

        it('should throw error for current provider as local nodes', async () => { 
            stubLoggerError = sandbox.stub(Logger, 'error');
            stubLoggerWarn = sandbox.stub(Logger, 'warn');

            await account.activateTestnetAccount([NON_BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('should return error as keys already exist', async () => { 
            stubLoggerError = sandbox.stub(Logger, 'error');
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await account.activateTestnetAccount([BOOTSTRAPPED_ACCOUNT]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => { 
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await account.activateTestnetAccount([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

    context('restore-wallet', async () => {
        it('should restore wallet using mnemonic and add into config', async () => { 
            const conseiljs = require(CONSEIL_JS);

            stubConseil = sandbox.stub(conseiljs.TezosWalletUtil, 'unlockIdentityWithMnemonic')
                                .withArgs(MNEMOMICS, '')
                                .returns(MNEMOMICS_KEYSTORE);

            stubAddIdentity = sandbox.stub(account, 'addIdentity')
                                .withArgs(NEW_WALLET, MNEMOMICS_KEYSTORE.privateKey, MNEMOMICS_KEYSTORE.publicKey, MNEMOMICS_KEYSTORE.publicKeyHash, '');
                    
            stubAddAccount = sandbox.stub(account, 'addAccount')
                                .withArgs(NEW_WALLET, MNEMOMICS_KEYSTORE.publicKeyHash, NEW_WALLET, testconfig.provider);

            stubLoggerInfo = sandbox.stub(Logger, 'info');

            await account.restoreWallet([NEW_WALLET, MNEMOMICS]);
            sinon.assert.calledOnce(stubConseil);
            sinon.assert.calledOnce(stubLoggerInfo);
            sinon.assert.calledOnce(stubAddIdentity);
            sinon.assert.calledOnce(stubAddAccount);
        });

        it('should return error as keys already exist', async () => { 
            stubLoggerError = sandbox.stub(Logger, 'error');
            await account.restoreWallet([BOOTSTRAPPED_ACCOUNT, MNEMOMICS]);
            sinon.assert.calledOnce(stubLoggerError);
        });

        it('invalid number of arguments', async () => { 
            stubLoggerWarn = sandbox.stub(Logger, 'warn');
            await account.restoreWallet([]);
            sinon.assert.calledOnce(stubLoggerWarn);
        });
    });

});