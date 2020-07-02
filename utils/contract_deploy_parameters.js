const contractDeployParameters = [
  {
    type : 'input',
    name : 'contractLabel',
    message : 'Enter contract label: '
  },
  {
    type : 'input',
    name : 'contractAbsolutePath',
    message : 'Enter absolute path of contract(.tz) file: '
  },
  {
    type : 'input',
    name : 'initStorageValue',
    message : 'Enter initial storage value: '
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

module.exports = { contractDeployParameters }