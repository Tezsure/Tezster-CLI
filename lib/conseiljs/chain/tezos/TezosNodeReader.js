"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TezosErrorTypes_1 = require("../../types/tezos/TezosErrorTypes");
const FetchSelector_1 = __importDefault(require("../../utils/FetchSelector"));
const LoggerSelector_1 = __importDefault(require("../../utils/LoggerSelector"));
const log = LoggerSelector_1.default.getLogger();
const fetch = FetchSelector_1.default.getFetch();
var TezosNodeReader;
(function (TezosNodeReader) {
    function performGetRequest(server, command) {
        const url = `${server}/${command}`;
        return fetch(url, { method: 'get' })
            .then(response => {
            if (!response.ok) {
                log.error(`TezosNodeReader.performGetRequest error: ${response.status} for ${command} on ${server}`);
                throw new TezosErrorTypes_1.TezosRequestError(response.status, response.statusText, url, null);
            }
            return response;
        })
            .then(response => {
            const json = response.json();
            log.debug(`TezosNodeReader.performGetRequest response: ${json} for ${command} on ${server}`);
            return json;
        });
    }
    function getBlock(server, hash = 'head', chainid = 'main') {
        return performGetRequest(server, `chains/${chainid}/blocks/${hash}`).then(json => { return json; });
    }
    TezosNodeReader.getBlock = getBlock;
    function getBlockHead(server) {
        return getBlock(server);
    }
    TezosNodeReader.getBlockHead = getBlockHead;
    function getAccountForBlock(server, blockHash, accountHash, chainid = 'main') {
        return performGetRequest(server, `chains/${chainid}/blocks/${blockHash}/context/contracts/${accountHash}`)
            .then(json => json);
    }
    TezosNodeReader.getAccountForBlock = getAccountForBlock;
    function getCounterForAccount(server, accountHash, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = yield performGetRequest(server, `chains/${chainid}/blocks/head/context/contracts/${accountHash}/counter`)
                .then(r => r);
            return parseInt(counter.toString(), 10);
        });
    }
    TezosNodeReader.getCounterForAccount = getCounterForAccount;
    function getSpendableBalanceForAccount(server, accountHash, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield performGetRequest(server, `chains/${chainid}/blocks/head/context/contracts/${accountHash}`)
                .then(json => json);
            return account.spendable ? parseInt(account.balance.toString(), 10) : 0;
        });
    }
    TezosNodeReader.getSpendableBalanceForAccount = getSpendableBalanceForAccount;
    function getAccountManagerForBlock(server, blockHash, accountHash, chainid = 'main') {
        return performGetRequest(server, `chains/${chainid}/blocks/${blockHash}/context/contracts/${accountHash}/manager_key`)
            .then(json => json);
    }
    TezosNodeReader.getAccountManagerForBlock = getAccountManagerForBlock;
    function isImplicitAndEmpty(server, accountHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield getBlockHead(server);
            const account = yield getAccountForBlock(server, blockHead.hash, accountHash);
            const isImplicit = accountHash.toLowerCase().startsWith('tz');
            const isEmpty = Number(account.balance) === 0;
            return (isImplicit && isEmpty);
        });
    }
    TezosNodeReader.isImplicitAndEmpty = isImplicitAndEmpty;
    function isManagerKeyRevealedForAccount(server, accountHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield getBlockHead(server);
            const managerKey = yield getAccountManagerForBlock(server, blockHead.hash, accountHash);
            return managerKey.key != null;
        });
    }
    TezosNodeReader.isManagerKeyRevealedForAccount = isManagerKeyRevealedForAccount;
})(TezosNodeReader = exports.TezosNodeReader || (exports.TezosNodeReader = {}));
//# sourceMappingURL=TezosNodeReader.js.map