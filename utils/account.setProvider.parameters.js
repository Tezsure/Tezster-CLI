const accountSetProviderParameters = [
    {
      type : 'list',
      name : 'newNodeProvider',
      message : 'Select new node provider: ',
      choices: ['http://localhost:18731', 'https://testnet.tezster.tech', 'https://tezos-dev.cryptonomic-infra.tech', 'https://carthagenet.SmartPy.io', 'http://carthagenet.tezos.cryptium.ch:8732']
    },
];

module.exports = { accountSetProviderParameters }