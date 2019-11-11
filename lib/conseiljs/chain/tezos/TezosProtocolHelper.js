"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TezosTypes = __importStar(require("../../types/tezos/TezosChainTypes"));
const TezosConstants_1 = require("../../types/tezos/TezosConstants");
const TezosNodeWriter_1 = require("./TezosNodeWriter");
var TezosProtocolHelper;
(function (TezosProtocolHelper) {
    function setDelegate(server, keyStore, delegator, delegate, fee, derivationPath = '') {
        if (delegator.startsWith('KT1')) {
            const parameters = `[{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "key_hash" }, { "string": "${delegate}" } ] }, { "prim": "SOME" }, { "prim": "SET_DELEGATE" }, { "prim": "CONS" } ]`;
            return TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keyStore, delegator, 0, fee, derivationPath, 0, TezosConstants_1.TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
        }
        else {
            return TezosNodeWriter_1.TezosNodeWriter.sendDelegationOperation(server, keyStore, delegate, fee, derivationPath);
        }
    }
    TezosProtocolHelper.setDelegate = setDelegate;
    function unSetDelegate(server, keyStore, delegator, fee, derivationPath = '') {
        if (delegator.startsWith('KT1')) {
            const parameters = `[{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "NONE", "args": [{ "prim": "key_hash" }] }, { "prim": "SET_DELEGATE" }, { "prim": "CONS" } ]`;
            return TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keyStore, delegator, 0, fee, derivationPath, 0, TezosConstants_1.TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
        }
        else {
            return TezosNodeWriter_1.TezosNodeWriter.sendUndelegationOperation(server, keyStore, fee, derivationPath);
        }
    }
    TezosProtocolHelper.unSetDelegate = unSetDelegate;
    function withdrawDelegatedFunds(server, keyStore, delegator, fee, amount, derivationPath = '') {
        let parameters = `[ { "prim": "DROP" },
            { "prim": "NIL", "args": [ { "prim": "operation" } ] },
            { "prim": "PUSH", "args": [ { "prim": "key_hash" }, { "string": "${keyStore.publicKeyHash}" } ] },
            { "prim": "IMPLICIT_ACCOUNT" },
            { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "${amount}" } ] },
            { "prim": "UNIT" },
            { "prim": "TRANSFER_TOKENS" },
            { "prim": "CONS" } ]`;
        return TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keyStore, delegator, 0, fee, derivationPath, 0, TezosConstants_1.TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
    }
    TezosProtocolHelper.withdrawDelegatedFunds = withdrawDelegatedFunds;
    function depositDelegatedFunds(server, keyStore, delegator, fee, amount, derivationPath = '') {
        return TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keyStore, delegator, amount, fee, derivationPath, 0, TezosConstants_1.TezosConstants.P005ManagerContractDepositGasLimit, undefined, undefined);
    }
    TezosProtocolHelper.depositDelegatedFunds = depositDelegatedFunds;
    function deployManagerContract(server, keyStore, delegate, fee, amount, derivationPath = '') {
        const code = `[ { "prim": "parameter",
        "args":
          [ { "prim": "or",
              "args":
                [ { "prim": "lambda",
                    "args":
                      [ { "prim": "unit" }, { "prim": "list", "args": [ { "prim": "operation" } ] } ], "annots": [ "%do" ] },
                  { "prim": "unit", "annots": [ "%default" ] } ] } ] },
      { "prim": "storage", "args": [ { "prim": "key_hash" } ] },
      { "prim": "code",
        "args":
          [ [ [ [ { "prim": "DUP" }, { "prim": "CAR" },
                  { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ] ],
              { "prim": "IF_LEFT",
                "args":
                  [ [ { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                      { "prim": "AMOUNT" },
                      [ [ { "prim": "COMPARE" }, { "prim": "EQ" } ],
                        { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" } ] ] ] } ],
                      [ { "prim": "DIP", "args": [ [ { "prim": "DUP" } ] ] },
                        { "prim": "SWAP" } ],
                      { "prim": "IMPLICIT_ACCOUNT" },
                      { "prim": "ADDRESS" },
                      { "prim": "SENDER" },
                      [ [ { "prim": "COMPARE" }, { "prim": "EQ" } ],
                        { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" },{ "prim": "FAILWITH" } ] ] ] } ],
                      { "prim": "UNIT" }, { "prim": "EXEC" },
                      { "prim": "PAIR" } ],
                    [ { "prim": "DROP" },
                      { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                      { "prim": "PAIR" } ] ] } ] ] } ]`;
        const storage = `{ "string": "${keyStore.publicKeyHash}" }`;
        return TezosNodeWriter_1.TezosNodeWriter.sendContractOriginationOperation(server, keyStore, amount, delegate, fee, derivationPath, 600, 20000, code, storage, TezosTypes.TezosParameterFormat.Micheline);
    }
    TezosProtocolHelper.deployManagerContract = deployManagerContract;
})(TezosProtocolHelper = exports.TezosProtocolHelper || (exports.TezosProtocolHelper = {}));
//# sourceMappingURL=TezosProtocolHelper.js.map