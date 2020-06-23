const ActivationOperation = 
{
  results: {
    contents: [{
      "kind": "activate_account",
      "pkh": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
      "secret": "9b7f631e52f877a1d363474404da8130b0b940ee",
      "metadata": {
        "balance_updates": [
          {
            "kind": "contract",
            "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
            "change": "13212502893"
          }
        ]
      }
    }],
    signature: 'edsigtyct41FagB4pH6ZVUE8ZJ4GZSB9DYtgQcUAaDdtGyGMisgnB6UZscLuXGExQcKvokHU3AmLPnSu16rpf8B15NgSdvMgVYL'
  },
  operationGroupID: '"onrs9CymfqtUNirHnJF53nrUebcwDR1uRdvq8b9KhhRc5LeYfLJ"\n'
}

const RevealOperation = 
{
  results: {
    contents: [    {
      "kind": "reveal",
      "source": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
      "fee": "1300",
      "counter": "17282",
      "gas_limit": "10000",
      "storage_limit": "0",
      "public_key": "edpku88EkY42ZKGTkiWTLkz8Th977n82AJWaZrmyBcrQ1dzo26aWKp",
      "metadata": {
        "balance_updates": [
          {
            "kind": "contract",
            "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
            "change": "-1300"
          },
          {
            "kind": "freezer",
            "category": "fees",
            "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
            "level": 69,
            "change": "1300"
          }
        ],
        "operation_result": {
          "status": "applied",
          "consumed_gas": "10000"
        }
      }
    }],
    signature: 'edsigtyct41FagB4pH6ZVUE8ZJ4GZSB9DYtgQcUAaDdtGyGMisgnB6UZscLuXGExQcKvokHU3AmLPnSu16rpf8B15NgSdvMgVYL'
  },
  operationGroupID: '"onrs9CymfqtUNirHnJF53nrUebcwDR1uRdvq8b9KhhRc5LeYfLg"\n'
}

const TransferOperation = 
{
  results: {
    contents: [{
      kind: 'transaction',
      source: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
      fee: '1500',
      counter: '2',
      gas_limit: '10600',
      storage_limit: '300',
      amount: '4000000',
      destination: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
      metadata: [Object]
    }],
    signature: 'edsigtbB6JotnHuM7xhGq76DtJhXkGScaLQhLV1vwgNL33vxEC4v6AygKZTbMWPmtFEqFByktpcRdSPzNVeW7sWswGLcF4YYUYg'
  },
  operationGroupID: '"opCnWfSC2GNFviDwzumXdQ5RfBUPD3i9ip2863a7Qxb9pXNrkBu"\n'
}



module.exports = { ActivationOperation, RevealOperation, TransferOperation }
