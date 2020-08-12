const confirmAnswerValidator = async (input) => {
    if (!input.includes('http')) {
        return 'Incorrect URL';
    }
    return true;
};

const accountSetProviderParameters = [
    {
        type : 'list',
        name : 'newNodeProvider',
        message : 'Select new rpc-node: ',
        choices: [
                  'http://localhost:18732', 
                  'https://testnet.tezster.tech', 
                  'https://tezos-dev.cryptonomic-infra.tech', 
                  'https://carthagenet.SmartPy.io', 
                  'https://mainnet.smartpy.io', 
                  'https://dalphanet.smartpy.io', 
                  'Enter Own Custom Url'
                ]
    }, 
    {
        type : 'input',
        name : 'newCustomNodeProvider',
        message : 'Enter Own Custom Url: ',
        when : (answers) => answers.newNodeProvider === 'Enter Own Custom Url',
        validate: confirmAnswerValidator
    },
];

module.exports = { accountSetProviderParameters }