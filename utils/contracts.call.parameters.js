const contractCallParameters = [
    {
      type : 'input',
      name : 'contractName',
      message : 'Enter contract name: '
    },
    {
      type : 'input',
      name : 'argumentValue',
      message : 'Enter argument value: '
    },
    {
        type : 'input',
        name : 'account',
        message : 'Enter account label/pkh: '
    },
    {
        type : 'input',
        name : 'amount',
        message : 'Enter amount: (optional, default is 0) ',
        default: 0,
    },
    {
        type : 'input',
        name : 'fee',
        message : 'Enter operation fee: (optional, default is 100000)',
        default: 100000,
    },
    {
        type : 'input',
        name : 'storageLimit',
        message : 'Enter storage limit: (optional, default is 10000)',
        default: 10000,
    },
    {
        type : 'input',
        name : 'gasLimit',
        message : 'Enter gas limit: (optional, default is 500000)',
        default: 500000,
    },
];

module.exports = { contractCallParameters }