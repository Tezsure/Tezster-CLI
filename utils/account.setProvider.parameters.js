const confirmAnswerValidator = async (input) => {
    if (!input.includes('http') || input.includes('delph')) {
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
                  'https://mainnet.tezster.tech', 
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