const confirmAnswerValidator = async (input) => {
    if (input === '') {
        return 'Incorrect input';
    }
    return true;
};

const contractDeployParameters = [
    {
        type : 'input',
        name : 'contractLabel',
        message : 'Enter contract label: ',
        validate: confirmAnswerValidator
    },
    {
        type : 'input',
        name : 'contractAbsolutePath',
        message : 'Enter absolute path of contract(.tz) file: ',
        validate: confirmAnswerValidator
    },
    {
        type : 'input',
        name : 'initStorageValue',
        message : 'Enter initial storage value: ',
        validate: confirmAnswerValidator
    },
    {
        type : 'input',
        name : 'account',
        message : 'Enter account label/pkh: ',
        validate: confirmAnswerValidator
    },
    {
        type : 'input',
        name : 'amount',
        message : 'Enter amount: (optional, default is 0 ꜩ) ',
        default: 0,
    },
    {
        type : 'input',
        name : 'fee',
        message : 'Enter operation fee: (optional, default is 100000 muꜩ)',
        default: 100000,
    },
    {
        type : 'input',
        name : 'storageLimit',
        message : 'Enter storage limit: (optional, default is 10000 muꜩ)',
        default: 10000,
    },
    {
        type : 'input',
        name : 'gasLimit',
        message : 'Enter gas limit: (optional, default is 500000 muꜩ)',
        default: 500000,
    },
];

module.exports = { contractDeployParameters }