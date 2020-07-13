"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const blakejs = __importStar(require("blakejs"));
const jsonpath_plus_1 = require("jsonpath-plus");
const TezosMessageUtil_1 = require("../TezosMessageUtil");
const TezosNodeReader_1 = require("../TezosNodeReader");
var DexterTokenHelper;
(function (DexterTokenHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, 'head', address);
            if (!!!contract.script) {
                throw new Error(`No code found at ${address}`);
            }
            const k = Buffer.from(blakejs.blake2s(contract['script'].toString(), null, 16)).toString('hex');
            if (k !== '1234') {
                throw new Error(`Contract at ${address} does not match the expected code hash`);
            }
            return true;
        });
    }
    DexterTokenHelper.verifyDestination = verifyDestination;
    function getBasicStorage(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            console.log('-----');
            console.log(storageResult);
            console.log('-----');
            return {
                mapid: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
                totalSupply: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].int', json: storageResult })[0])
            };
        });
    }
    DexterTokenHelper.getBasicStorage = getBasicStorage;
    function getAddressRecord(server, mapid, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, key);
            if (!!!mapResult) {
                return undefined;
            }
            return {
                allowances: jsonpath_plus_1.JSONPath({ path: '$.args[0]', json: mapResult })[0],
                balance: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].int', json: mapResult })[0])
            };
        });
    }
    DexterTokenHelper.getAddressRecord = getAddressRecord;
    function deployContract(server, manager, supply) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    DexterTokenHelper.deployContract = deployContract;
})(DexterTokenHelper = exports.DexterTokenHelper || (exports.DexterTokenHelper = {}));
//# sourceMappingURL=DexterTokenHelper.js.map