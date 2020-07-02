"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bs58check_1 = __importDefault(require("bs58check"));
const big_integer_1 = __importDefault(require("big-integer"));
const CryptoUtils_1 = require("../../utils/CryptoUtils");
const TezosLanguageUtil_1 = require("./TezosLanguageUtil");
const TezosChainTypes_1 = require("../../types/tezos/TezosChainTypes");
var TezosMessageUtils;
(function (TezosMessageUtils) {
    function writeBoolean(value) {
        return value ? "ff" : "00";
    }
    TezosMessageUtils.writeBoolean = writeBoolean;
    function readBoolean(hex) {
        return parseInt(hex, 16) > 0 ? true : false;
    }
    TezosMessageUtils.readBoolean = readBoolean;
    function writeInt(value) {
        if (value < 0) {
            throw new Error('Use writeSignedInt to encode negative numbers');
        }
        return Buffer.from(Buffer.from(CryptoUtils_1.CryptoUtils.twoByteHex(value), 'hex').map((v, i) => { return i === 0 ? v : v ^ 0x80; }).reverse()).toString('hex');
    }
    TezosMessageUtils.writeInt = writeInt;
    function writeSignedInt(value) {
        if (value === 0) {
            return '00';
        }
        const n = big_integer_1.default(value).abs();
        const l = n.bitLength().toJSNumber();
        let arr = [];
        let v = n;
        for (let i = 0; i < l; i += 7) {
            let byte = big_integer_1.default.zero;
            if (i === 0) {
                byte = v.and(0x3f);
                v = v.shiftRight(6);
            }
            else {
                byte = v.and(0x7f);
                v = v.shiftRight(7);
            }
            if (value < 0 && i === 0) {
                byte = byte.or(0x40);
            }
            if (i + 7 < l) {
                byte = byte.or(0x80);
            }
            arr.push(byte.toJSNumber());
        }
        if (l % 7 === 0) {
            arr[arr.length - 1] = arr[arr.length - 1] | 0x80;
            arr.push(1);
        }
        return arr.map(v => ('0' + v.toString(16)).slice(-2)).join('');
    }
    TezosMessageUtils.writeSignedInt = writeSignedInt;
    function readInt(hex) {
        const h = Buffer.from(Buffer.from(hex, 'hex').reverse().map((v, i) => { return i === 0 ? v : v & 0x7f; })).toString('hex');
        return CryptoUtils_1.CryptoUtils.fromByteHex(h);
    }
    TezosMessageUtils.readInt = readInt;
    function readSignedInt(hex) {
        const positive = (Buffer.from(hex.slice(0, 2), 'hex')[0] & 0x40) ? false : true;
        const arr = Buffer.from(hex, 'hex').map((v, i) => i === 0 ? v & 0x3f : v & 0x7f);
        let n = big_integer_1.default.zero;
        for (let i = arr.length - 1; i >= 0; i--) {
            if (i === 0) {
                n = n.or(arr[i]);
            }
            else {
                n = n.or(big_integer_1.default(arr[i]).shiftLeft(7 * i - 1));
            }
        }
        return positive ? n.toJSNumber() : n.negate().toJSNumber();
    }
    TezosMessageUtils.readSignedInt = readSignedInt;
    function findInt(hex, offset, signed = false) {
        let buffer = "";
        let i = 0;
        while (offset + i * 2 < hex.length) {
            let start = offset + i * 2;
            let end = start + 2;
            let part = hex.substring(start, end);
            buffer += part;
            i += 1;
            if (parseInt(part, 16) < 127) {
                break;
            }
        }
        return signed ? { value: readSignedInt(buffer), length: i * 2 } : { value: readInt(buffer), length: i * 2 };
    }
    TezosMessageUtils.findInt = findInt;
    function writeString(value) {
        const len = dataLength(value.length);
        const text = value.split('').map(c => c.charCodeAt(0).toString(16)).join('');
        return len + text;
    }
    TezosMessageUtils.writeString = writeString;
    function readString(hex) {
        const stringLen = parseInt(hex.substring(0, 8), 16);
        if (stringLen === 0) {
            return '';
        }
        const stringHex = hex.slice(8);
        let text = '';
        for (let i = 0; i < stringHex.length; i += 2) {
            text += String.fromCharCode(parseInt(stringHex.substring(i, i + 2), 16));
        }
        return text;
    }
    TezosMessageUtils.readString = readString;
    function readAddress(hex) {
        if (hex.length !== 44 && hex.length !== 42) {
            throw new Error("Incorrect hex length to parse an address");
        }
        let implicitHint = hex.length === 44 ? hex.substring(0, 4) : "00" + hex.substring(0, 2);
        let implicitPrefixLength = hex.length === 44 ? 4 : 2;
        if (implicitHint === "0000") {
            return bs58check_1.default.encode(Buffer.from("06a19f" + hex.substring(implicitPrefixLength), "hex"));
        }
        else if (implicitHint === "0001") {
            return bs58check_1.default.encode(Buffer.from("06a1a1" + hex.substring(implicitPrefixLength), "hex"));
        }
        else if (implicitHint === "0002") {
            return bs58check_1.default.encode(Buffer.from("06a1a4" + hex.substring(implicitPrefixLength), "hex"));
        }
        else if (hex.substring(0, 2) === "01" && hex.length === 44) {
            return bs58check_1.default.encode(Buffer.from("025a79" + hex.substring(2, 42), "hex"));
        }
        else {
            throw new Error("Unrecognized address type");
        }
    }
    TezosMessageUtils.readAddress = readAddress;
    function readAddressWithHint(b, hint) {
        const address = !(b instanceof Buffer) ? Buffer.from(b) : b;
        if (hint === 'tz1') {
            return readAddress(`0000${address.toString('hex')}`);
        }
        else if (hint === 'tz2') {
            return readAddress(`0001${address.toString('hex')}`);
        }
        else if (hint === 'tz3') {
            return readAddress(`0002${address.toString('hex')}`);
        }
        else if (hint === 'kt1') {
            return readAddress(`01${address.toString('hex')}00`);
        }
        else {
            throw new Error(`Unrecognized address hint, '${hint}'`);
        }
    }
    TezosMessageUtils.readAddressWithHint = readAddressWithHint;
    function writeAddress(address) {
        const hex = bs58check_1.default.decode(address).slice(3).toString("hex");
        if (address.startsWith("tz1")) {
            return "0000" + hex;
        }
        else if (address.startsWith("tz2")) {
            return "0001" + hex;
        }
        else if (address.startsWith("tz3")) {
            return "0002" + hex;
        }
        else if (address.startsWith("KT1")) {
            return "01" + hex + "00";
        }
        else {
            throw new Error(`Unrecognized address prefix: ${address.substring(0, 3)}`);
        }
    }
    TezosMessageUtils.writeAddress = writeAddress;
    function readBranch(hex) {
        if (hex.length !== 64) {
            throw new Error('Incorrect hex length to parse a branch hash');
        }
        return bs58check_1.default.encode(Buffer.from('0134' + hex, 'hex'));
    }
    TezosMessageUtils.readBranch = readBranch;
    function writeBranch(branch) {
        return bs58check_1.default.decode(branch).slice(2).toString("hex");
    }
    TezosMessageUtils.writeBranch = writeBranch;
    function readPublicKey(hex) {
        if (hex.length !== 66 && hex.length !== 68) {
            throw new Error(`Incorrect hex length, ${hex.length} to parse a key`);
        }
        let hint = hex.substring(0, 2);
        if (hint === "00") {
            return bs58check_1.default.encode(Buffer.from("0d0f25d9" + hex.substring(2), "hex"));
        }
        else if (hint === "01" && hex.length === 68) {
            return bs58check_1.default.encode(Buffer.from("03fee256" + hex.substring(2), "hex"));
        }
        else if (hint === "02" && hex.length === 68) {
            return bs58check_1.default.encode(Buffer.from("03b28b7f" + hex.substring(2), "hex"));
        }
        else {
            throw new Error('Unrecognized key type');
        }
    }
    TezosMessageUtils.readPublicKey = readPublicKey;
    function writePublicKey(publicKey) {
        if (publicKey.startsWith("edpk")) {
            return "00" + bs58check_1.default.decode(publicKey).slice(4).toString("hex");
        }
        else if (publicKey.startsWith("sppk")) {
            return "01" + bs58check_1.default.decode(publicKey).slice(4).toString("hex");
        }
        else if (publicKey.startsWith("p2pk")) {
            return "02" + bs58check_1.default.decode(publicKey).slice(4).toString("hex");
        }
        else {
            throw new Error('Unrecognized key type');
        }
    }
    TezosMessageUtils.writePublicKey = writePublicKey;
    function readKeyWithHint(b, hint) {
        const key = !(b instanceof Buffer) ? Buffer.from(b) : b;
        if (hint === 'edsk') {
            return bs58check_1.default.encode(Buffer.from('2bf64e07' + key.toString('hex'), 'hex'));
        }
        else if (hint === 'edpk') {
            return readPublicKey(`00${key.toString('hex')}`);
        }
        else {
            throw new Error(`Unrecognized key hint, '${hint}'`);
        }
    }
    TezosMessageUtils.readKeyWithHint = readKeyWithHint;
    function writeKeyWithHint(key, hint) {
        if (hint === 'edsk' || hint === 'edpk') {
            return bs58check_1.default.decode(key).slice(4);
        }
        else {
            throw new Error(`Unrecognized key hint, '${hint}'`);
        }
    }
    TezosMessageUtils.writeKeyWithHint = writeKeyWithHint;
    function readSignatureWithHint(b, hint) {
        const sig = !(b instanceof Buffer) ? Buffer.from(b) : b;
        if (hint === 'edsig') {
            return bs58check_1.default.encode(Buffer.from('09f5cd8612' + sig.toString('hex'), 'hex'));
        }
        else {
            throw new Error(`Unrecognized signature hint, '${hint}'`);
        }
    }
    TezosMessageUtils.readSignatureWithHint = readSignatureWithHint;
    function writeSignatureWithHint(sig, hint) {
        if (hint === 'edsig') {
            return bs58check_1.default.decode(sig).slice(5);
        }
        else {
            throw new Error(`Unrecognized key hint, '${hint}'`);
        }
    }
    TezosMessageUtils.writeSignatureWithHint = writeSignatureWithHint;
    function readBufferWithHint(b, hint) {
        const buffer = !(b instanceof Buffer) ? Buffer.from(b) : b;
        if (hint === 'op') {
            return bs58check_1.default.encode(Buffer.from('0574' + buffer.toString('hex'), 'hex'));
        }
        else if (hint === 'p') {
            return bs58check_1.default.encode(Buffer.from('02aa' + buffer.toString('hex'), 'hex'));
        }
        else if (hint === 'expr') {
            return bs58check_1.default.encode(Buffer.from('0d2c401b' + buffer.toString('hex'), 'hex'));
        }
        else if (hint === '') {
            return bs58check_1.default.encode(buffer);
        }
        else {
            throw new Error(`Unsupported hint, '${hint}'`);
        }
    }
    TezosMessageUtils.readBufferWithHint = readBufferWithHint;
    function writeBufferWithHint(b) {
        return bs58check_1.default.decode(b);
    }
    TezosMessageUtils.writeBufferWithHint = writeBufferWithHint;
    function computeOperationHash(signedOpGroup) {
        const hash = CryptoUtils_1.CryptoUtils.simpleHash(signedOpGroup.bytes, 32);
        return readBufferWithHint(hash, "op");
    }
    TezosMessageUtils.computeOperationHash = computeOperationHash;
    function computeKeyHash(key, prefix = 'tz1') {
        const hash = CryptoUtils_1.CryptoUtils.simpleHash(key, 20);
        return readAddressWithHint(hash, prefix);
    }
    TezosMessageUtils.computeKeyHash = computeKeyHash;
    function dataLength(value) {
        return ('0000000' + (value).toString(16)).slice(-8);
    }
    function writePackedData(value, type, format = TezosChainTypes_1.TezosParameterFormat.Micheline) {
        switch (type) {
            case 'int': {
                return '0500' + writeSignedInt(value);
            }
            case 'nat': {
                return '0500' + writeInt(value);
            }
            case 'string': {
                return '0501' + writeString(value);
            }
            case 'key_hash': {
                const address = writeAddress(value).slice(2);
                return `050a${dataLength(address.length / 2)}${address}`;
            }
            case 'address': {
                const address = writeAddress(value);
                return `050a${dataLength(address.length / 2)}${address}`;
            }
            case 'bytes': {
                const buffer = value.toString('hex');
                return `050a${dataLength(buffer.length / 2)}${buffer}`;
            }
            default: {
                try {
                    if (format === TezosChainTypes_1.TezosParameterFormat.Micheline) {
                        return `05${TezosLanguageUtil_1.TezosLanguageUtil.translateMichelineToHex(value)}`;
                    }
                    else if (format === TezosChainTypes_1.TezosParameterFormat.Michelson) {
                        const micheline = TezosLanguageUtil_1.TezosLanguageUtil.translateMichelsonToMicheline(value);
                        return `05${TezosLanguageUtil_1.TezosLanguageUtil.translateMichelineToHex(micheline)}`;
                    }
                    else {
                        throw new Error(`Unsupported format, ${format}, provided`);
                    }
                }
                catch (e) {
                    throw new Error(`Unrecognized data type or format: '${type}', '${format}': ${e}`);
                }
            }
        }
    }
    TezosMessageUtils.writePackedData = writePackedData;
    function readPackedData(hex, type) {
        switch (type) {
            case 'int': {
                return readSignedInt(hex.slice(4));
            }
            case 'nat': {
                return readInt(hex.slice(4));
            }
            case 'string': {
                return readString(hex.slice(4));
            }
            case 'key_hash': {
                return readAddress(`00${hex.slice(4 + 8)}`);
            }
            case 'address': {
                return readAddress(hex.slice(4 + 8));
            }
            case 'bytes': {
                return hex.slice(4 + 8);
            }
            default: {
                return TezosLanguageUtil_1.TezosLanguageUtil.hexToMicheline(hex.slice(2)).code;
            }
        }
    }
    TezosMessageUtils.readPackedData = readPackedData;
    function encodeBigMapKey(key) {
        return readBufferWithHint(CryptoUtils_1.CryptoUtils.simpleHash(key, 32), 'expr');
    }
    TezosMessageUtils.encodeBigMapKey = encodeBigMapKey;
})(TezosMessageUtils = exports.TezosMessageUtils || (exports.TezosMessageUtils = {}));
//# sourceMappingURL=TezosMessageUtil.js.map