const confirmAnswerValidator = async (input) => {
    if (input === '') {
        return 'Incorrect input';
    }
    return true;
};

const accountRestoreWalletParameters = [
{
    type : 'list',
    name : 'restoreWallet',
    message : 'Restore wallet using: ',
    choices: [ 'Mnemonic Phrases', 'Private/Secret Key']
}, 
{
    type : 'input',
    name : 'mnemomic',
    message : 'Enter mnemomic phrase: ',
    when : (answers) => answers.restoreWallet === 'Mnemonic Phrases',
    validate: confirmAnswerValidator
},
{
    type : 'input',
    name : 'secret',
    message : 'Enter secret/private key: ',
    when : (answers) => answers.restoreWallet === 'Private/Secret Key',
    validate: confirmAnswerValidator
},

];

module.exports = { accountRestoreWalletParameters }