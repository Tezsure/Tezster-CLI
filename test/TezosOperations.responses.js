const sendContractOriginationOperation = 
{ "applied": 
  {
    "results":
      {
        "contents": [
          {
            "kind": "origination",
            "source": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
            "fee": "100000",
            "counter": "17284",
            "gas_limit": "10160",
            "storage_limit": "277",
            "manager_pubkey": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
            "balance": "10000000",
            "delegate": "tz1db53osfzRqqgQeLtBt4kcFcQoXJwPJJ5G",
            "metadata": {
              "balance_updates": [
                {
                  "kind": "contract",
                  "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                  "change": "-100000"
                },
                {
                  "kind": "freezer",
                  "category": "fees",
                  "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
                  "level": 69,
                  "change": "100000"
                }
              ],
              "operation_result": {
                "status": "applied",
                "balance_updates": [
                  {
                    "kind": "contract",
                    "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                    "change": "-257000"
                  }
                ],
                "originated_contracts": [
                  "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM"
                ],
                "consumed_gas": "10000"
              }
            }
          }
        ],
        "signature": "edsigtvkJX3RDTk6sYysLyPkhVFsA5HgnuTTZRcsPsC461YctQrmpgjD8aGK4xDMat7zfirD9UHHqfp5G2rSxEXLjY1iav9F1XM"
      }
  },
  "failed":
  {
    "results":
    {
      "contents": [
        {
          "kind": "origination",
          "source": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
          "fee": "100000",
          "counter": "17284",
          "gas_limit": "10160",
          "storage_limit": "277",
          "manager_pubkey": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
          "balance": "10000000",
          "delegate": "tz1db53osfzRqqgQeLtBt4kcFcQoXJwPJJ5G",
          "metadata": {
            "balance_updates": [
              {
                "kind": "contract",
                "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                "change": "-100000"
              },
              {
                "kind": "freezer",
                "category": "fees",
                "delegate": "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",
                "level": 69,
                "change": "100000"
              }
            ],
            "operation_result": {
              "status": "failed",
              "balance_updates": [
                {
                  "kind": "contract",
                  "contract": "tz1LoKbFyYHTkCnj9mgRKFb9g8pP4Lr3zniP",
                  "change": "-257000"
                }
              ],
              "originated_contracts": [
                "KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM"
              ],
              "consumed_gas": "10000"
            }
          }
        }
      ],
      "signature": "edsigtvkJX3RDTk6sYysLyPkhVFsA5HgnuTTZRcsPsC461YctQrmpgjD8aGK4xDMat7zfirD9UHHqfp5G2rSxEXLjY1iav9F1XM"
    }
  },
}

const sendContractInvocationOperation = {
  "applied": 
  {
    results: {
      contents: [
        {
          kind: 'transaction',
          source: 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN',
          fee: '100000',
          counter: '11',
          gas_limit: '100000',
          storage_limit: '10000',
          amount: '0',
          destination: 'KT1WvyJ1qUrWzShA2T6QeL7AW4DR6GspUimM',
          parameters: [Object],
          metadata: {
            balance_updates: [
              {
                kind: 'contract',
                contract: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
                change: '-100000'
              },
              {
                kind: 'freezer',
                category: 'fees',
                delegate: 'tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU',
                cycle: 1365,
                change: '100000'
              }
            ],
            operation_result: {
              status: 'applied',
              storage: { int: '0' },
              consumed_gas: '15345',
              storage_size: '263'
            }
          }          
        }
      ],
      signature: 'edsigtiopyo5oB3y3H5R6J5YiR4GLkah2MFQ336NuR3x4txgsJHRnvpfszgAsKeBCBXwRcuXHymMi1e5fvQjhzdkucEUfQWSJ3V'
    },
    operationGroupID: '"ooHWp24SiVPXyGGJv91ySQECAyrya3Us43MJzyvJ6phUPAC66Lv"\n'
  }
  
}

module.exports = { sendContractOriginationOperation, sendContractInvocationOperation };