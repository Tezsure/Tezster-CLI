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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hw_transport_node_hid_1 = __importDefault(require("@ledgerhq/hw-transport-node-hid"));
const TezosMessageUtil_1 = require("../../chain/tezos/TezosMessageUtil");
const HardwareDeviceType_1 = require("../../types/wallet/HardwareDeviceType");
const KeyStore_1 = require("../../types/wallet/KeyStore");
const TezosLedgerConnector_1 = __importDefault(require("../../identity/tezos/TezosLedgerConnector"));
class TransportInstance {
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.transport === null) {
                this.transport = yield hw_transport_node_hid_1.default.create();
            }
            return this.transport;
        });
    }
}
TransportInstance.transport = null;
var TezosLedgerWallet;
(function (TezosLedgerWallet) {
    function unlockAddress(deviceType, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (deviceType !== HardwareDeviceType_1.HardwareDeviceType.LedgerNanoS) {
                throw new Error("Unsupported hardware device");
            }
            const hexEncodedPublicKey = yield getTezosPublicKey(derivationPath);
            const publicKeyBytes = Buffer.from(hexEncodedPublicKey, 'hex').slice(1);
            const publicKey = TezosMessageUtil_1.TezosMessageUtils.readKeyWithHint(publicKeyBytes, "edpk");
            const publicKeyHash = TezosMessageUtil_1.TezosMessageUtils.computeKeyHash(publicKeyBytes, 'tz1');
            return { publicKey: publicKey, privateKey: '', publicKeyHash: publicKeyHash, seed: '', storeType: KeyStore_1.StoreType.Hardware, derivationPath };
        });
    }
    TezosLedgerWallet.unlockAddress = unlockAddress;
    function getTezosPublicKey(derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const transport = yield TransportInstance.getInstance();
            const xtz = new TezosLedgerConnector_1.default(transport);
            return xtz.getAddress(derivationPath, true);
        });
    }
    TezosLedgerWallet.getTezosPublicKey = getTezosPublicKey;
    function signTezosOperation(derivationPath, watermarkedOpInHex) {
        return __awaiter(this, void 0, void 0, function* () {
            const transport = yield TransportInstance.getInstance();
            const xtz = new TezosLedgerConnector_1.default(transport);
            const result = yield xtz.signOperation(derivationPath, watermarkedOpInHex);
            const signatureBytes = Buffer.from(result, 'hex');
            return signatureBytes;
        });
    }
    TezosLedgerWallet.signTezosOperation = signTezosOperation;
    function signText(derivationPath, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const transport = yield TransportInstance.getInstance();
            const xtz = new TezosLedgerConnector_1.default(transport);
            const result = yield xtz.signHex(derivationPath, Buffer.from(message, 'utf8').toString('hex'));
            const messageSig = Buffer.from(result, 'hex');
            return TezosMessageUtil_1.TezosMessageUtils.readSignatureWithHint(messageSig, 'edsig');
        });
    }
    TezosLedgerWallet.signText = signText;
    function initLedgerTransport() {
        TransportInstance.transport = null;
    }
    TezosLedgerWallet.initLedgerTransport = initLedgerTransport;
})(TezosLedgerWallet = exports.TezosLedgerWallet || (exports.TezosLedgerWallet = {}));
//# sourceMappingURL=TezosLedgerWallet.js.map