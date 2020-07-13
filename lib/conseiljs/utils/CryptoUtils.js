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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blakejs = __importStar(require("blakejs"));
const big_integer_1 = __importDefault(require("big-integer"));
const wrapper = require('./WrapperWrapper');
var CryptoUtils;
(function (CryptoUtils) {
    function generateSaltForPwHash() {
        return __awaiter(this, void 0, void 0, function* () {
            const s = yield wrapper.salt();
            return s;
        });
    }
    CryptoUtils.generateSaltForPwHash = generateSaltForPwHash;
    function encryptMessage(message, passphrase, salt) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageBytes = Buffer.from(message);
            const keyBytes = yield wrapper.pwhash(passphrase, salt);
            const n = yield wrapper.nonce();
            const nonce = Buffer.from(n);
            const s = yield wrapper.close(messageBytes, nonce, keyBytes);
            const cipherText = Buffer.from(s);
            return Buffer.concat([nonce, cipherText]);
        });
    }
    CryptoUtils.encryptMessage = encryptMessage;
    function decryptMessage(nonce_and_ciphertext, passphrase, salt) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyBytes = yield wrapper.pwhash(passphrase, salt);
            const m = yield wrapper.open(nonce_and_ciphertext, keyBytes);
            return Buffer.from(m).toString();
        });
    }
    CryptoUtils.decryptMessage = decryptMessage;
    function simpleHash(payload, length) {
        return Buffer.from(blakejs.blake2b(payload, null, length));
    }
    CryptoUtils.simpleHash = simpleHash;
    function generateKeys(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            const k = yield wrapper.keys(seed);
            return { privateKey: k.privateKey, publicKey: k.publicKey };
        });
    }
    CryptoUtils.generateKeys = generateKeys;
    function recoverPublicKey(secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const k = yield wrapper.publickey(secretKey);
            return { privateKey: k.privateKey, publicKey: k.publicKey };
        });
    }
    CryptoUtils.recoverPublicKey = recoverPublicKey;
    function signDetached(payload, secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const b = yield wrapper.sign(payload, secretKey);
            return Buffer.from(b);
        });
    }
    CryptoUtils.signDetached = signDetached;
    function checkSignature(signature, payload, publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wrapper.checkSignature(signature, payload, publicKey);
        });
    }
    CryptoUtils.checkSignature = checkSignature;
    function twoByteHex(n) {
        if (n < 128) {
            return ('0' + n.toString(16)).slice(-2);
        }
        let h = '';
        if (n > 2147483648) {
            let r = big_integer_1.default(n);
            while (r.greater(0)) {
                h = ('0' + (r.and(127)).toString(16)).slice(-2) + h;
                r = r.shiftRight(7);
            }
        }
        else {
            let r = n;
            while (r > 0) {
                h = ('0' + (r & 127).toString(16)).slice(-2) + h;
                r = r >> 7;
            }
        }
        return h;
    }
    CryptoUtils.twoByteHex = twoByteHex;
    function fromByteHex(s) {
        if (s.length === 2) {
            return parseInt(s, 16);
        }
        if (s.length <= 8) {
            let n = parseInt(s.slice(-2), 16);
            for (let i = 1; i < s.length / 2; i++) {
                n += parseInt(s.slice(-2 * i - 2, -2 * i), 16) << (7 * i);
            }
            return n;
        }
        let n = big_integer_1.default(parseInt(s.slice(-2), 16));
        for (let i = 1; i < s.length / 2; i++) {
            n = n.add(big_integer_1.default(parseInt(s.slice(-2 * i - 2, -2 * i), 16)).shiftLeft(7 * i));
        }
        return n.toJSNumber();
    }
    CryptoUtils.fromByteHex = fromByteHex;
})(CryptoUtils = exports.CryptoUtils || (exports.CryptoUtils = {}));
//# sourceMappingURL=CryptoUtils.js.map