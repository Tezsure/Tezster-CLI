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
const jsonpath_1 = require("jsonpath");
const TezosMessageUtil_1 = require("../TezosMessageUtil");
const TezosNodeReader_1 = require("../TezosNodeReader");
var TCFBakerRegistryHelper;
(function (TCFBakerRegistryHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, 'head', address);
            if (!!!contract.script) {
                throw new Error(`No code found at ${address}`);
            }
            const k = Buffer.from(blakejs.blake2s(contract['script'].toString(), null, 16)).toString('hex');
            if (k !== '1527ddf08bdf582dce0b28c051044897') {
                throw new Error(`Contract at ${address} does not match the expected code hash`);
            }
            return true;
        });
    }
    TCFBakerRegistryHelper.verifyDestination = verifyDestination;
    function getFees(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            const jsonpath = new jsonpath_1.JSONPath();
            return {
                mapid: parseInt(jsonpath.query(storageResult, '$.args[0].int')[0]),
                owner: jsonpath.query(storageResult, '$.args[1].args[0].string')[0],
                signupFee: parseInt(jsonpath.query(storageResult, '$.args[1].args[1].args[0].int')[0]),
                updateFee: parseInt(jsonpath.query(storageResult, '$.args[1].args[1].args[1].int')[0])
            };
        });
    }
    TCFBakerRegistryHelper.getFees = getFees;
    function updateRegistration(server, address, baker, name, isAcceptingDelegation, detailsURL, payoutShare) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    TCFBakerRegistryHelper.updateRegistration = updateRegistration;
    function queryRegistration(server, mapid, baker) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(baker, 'key_hash'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, key);
            if (!!!mapResult) {
                return undefined;
            }
            const jsonpath = new jsonpath_1.JSONPath();
            const textDecoder = new TextDecoder();
            const paymentConfigMask = Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[1].args[0].args[1].int')[0]);
            return {
                name: textDecoder.decode(Buffer.from(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[0].args[0].args[0].bytes')[0], 'hex')),
                isAcceptingDelegation: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[0].args[0].args[1].prim')[0]),
                externalDataURL: textDecoder.decode(Buffer.from(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[0].args[1].bytes')[0], 'hex')),
                split: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[0].args[0].int')[0]) / 10000,
                paymentAccounts: jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[0].args[1]..string'),
                minimumDelegation: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[0].args[0].int')[0]),
                isGreedy: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[0].args[1].prim')[0]),
                payoutDelay: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[0].int')[0]),
                payoutFrequency: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[1].args[0].int')[0]),
                minimumPayout: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[1].args[1].int')[0]),
                isCheap: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[1].args[0].args[0].prim')[0]),
                paymentConfig: {
                    payForOwnBlocks: Boolean(paymentConfigMask & 1),
                    payForEndorsements: Boolean(paymentConfigMask & 2),
                    payGainedFees: Boolean(paymentConfigMask & 4),
                    payForAccusationGains: Boolean(paymentConfigMask & 8),
                    subtractLostDepositsWhenAccused: Boolean(paymentConfigMask & 16),
                    subtractLostRewardsWhenAccused: Boolean(paymentConfigMask & 32),
                    subtractLostFeesWhenAccused: Boolean(paymentConfigMask & 64),
                    payForRevelation: Boolean(paymentConfigMask & 128),
                    subtractLostRewardsWhenMissRevelation: Boolean(paymentConfigMask & 256),
                    subtractLostFeesWhenMissRevelation: Boolean(paymentConfigMask & 512),
                    compensateMissedBlocks: !Boolean(paymentConfigMask & 1024),
                    payForStolenBlocks: Boolean(paymentConfigMask & 2048),
                    compensateMissedEndorsements: !Boolean(paymentConfigMask & 4096),
                    compensateLowPriorityEndorsementLoss: !Boolean(paymentConfigMask & 8192)
                },
                overdelegationThreshold: Number(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[1].args[1].args[0].int')[0]),
                subtractRewardsFromUninvitedDelegation: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].args[1].args[1].args[1].args[1].prim')[0]),
                recordManager: jsonpath.query(mapResult, '$.args[0].args[1].args[0].string')[0],
                timestamp: new Date(jsonpath.query(mapResult, '$.args[1].string')[0])
            };
        });
    }
    TCFBakerRegistryHelper.queryRegistration = queryRegistration;
})(TCFBakerRegistryHelper = exports.TCFBakerRegistryHelper || (exports.TCFBakerRegistryHelper = {}));
//# sourceMappingURL=TCFBakerRegistryHelper.js.map