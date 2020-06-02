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
  }
}

module.exports = {sendContractOriginationOperation};