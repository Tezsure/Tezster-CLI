const accountSetProviderParameters = [
    {
      type : 'list',
      name : 'newNodeProvider',
      message : 'Select new rpc-node: ',
      choices: ['http://localhost:18731', 'https://testnet.tezster.tech', 'https://tezos-dev.cryptonomic-infra.tech', 'https://carthagenet.SmartPy.io']
    },
];

module.exports = { accountSetProviderParameters }