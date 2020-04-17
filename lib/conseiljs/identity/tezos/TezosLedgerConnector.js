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
const bip32path = __importStar(require("bip32-path"));
var Curve;
(function (Curve) {
    Curve[Curve["ED25519"] = 0] = "ED25519";
    Curve[Curve["SECP256K1"] = 1] = "SECP256K1";
    Curve[Curve["SECP256R1"] = 2] = "SECP256R1";
})(Curve = exports.Curve || (exports.Curve = {}));
;
var Instruction;
(function (Instruction) {
    Instruction[Instruction["INS_VERSION"] = 0] = "INS_VERSION";
    Instruction[Instruction["INS_GET_PUBLIC_KEY"] = 2] = "INS_GET_PUBLIC_KEY";
    Instruction[Instruction["INS_PROMPT_PUBLIC_KEY"] = 3] = "INS_PROMPT_PUBLIC_KEY";
    Instruction[Instruction["INS_SIGN"] = 4] = "INS_SIGN";
    Instruction[Instruction["INS_SIGN_UNSAFE"] = 5] = "INS_SIGN_UNSAFE";
})(Instruction = exports.Instruction || (exports.Instruction = {}));
class TezosLedgerConnector {
    constructor(transport) {
        this.transport = transport;
        transport.decorateAppAPIMethods(this, ["getAddress", "signOperation", "signHash", "getVersion"], "XTZ");
    }
    getAddress(path, prompt = true, curve = Curve.ED25519) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.transport.send(0x80, prompt ? Instruction.INS_PROMPT_PUBLIC_KEY : Instruction.INS_GET_PUBLIC_KEY, 0x00, curve, this.pathToBuffer(path));
                const publicKey = response.slice(1, 1 + response[0]);
                return publicKey.toString('hex');
            }
            catch (err) {
                if (err.message.includes('0x6985')) {
                    throw new Error('Public key request rejected on device.');
                }
                else {
                    throw err;
                }
            }
        });
    }
    signOperation(path, hex, curve = Curve.ED25519) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sign(path, curve, Instruction.INS_SIGN, hex);
        });
    }
    signHex(path, hex, curve = Curve.ED25519) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sign(path, curve, Instruction.INS_SIGN_UNSAFE, hex);
        });
    }
    getVersionString() {
        return __awaiter(this, void 0, void 0, function* () {
            const [appFlag, major, minor, patch] = yield this.transport.send(0x80, Instruction.INS_VERSION, 0x00, 0x00, new Buffer(0));
            return `${major}.${minor}.${patch}${appFlag === 1 ? ' baker' : ''}`;
        });
    }
    sign(path, curve, instruction, hex) {
        return __awaiter(this, void 0, void 0, function* () {
            const bytes = Buffer.from(hex, "hex");
            let message = [];
            message.push(this.pathToBuffer(path));
            const maxChunkSize = 230;
            for (let offset = 0, part = 0; offset !== bytes.length; offset += part) {
                part = offset + maxChunkSize > bytes.length ? bytes.length - offset : maxChunkSize;
                const buffer = Buffer.alloc(part);
                bytes.copy(buffer, 0, offset, offset + part);
                message.push(buffer);
            }
            let response = yield this.transport.send(0x80, instruction, 0x00, curve, message[0]);
            for (let i = 1; i < message.length; i++) {
                let code = (i === message.length - 1) ? 0x81 : 0x01;
                response = yield this.transport.send(0x80, instruction, code, curve, message[i]);
            }
            const signature = response.slice(0, response.length - 2).toString("hex");
            return signature;
        });
    }
    pathToBuffer(path) {
        let pathArray = bip32path.fromString(path).toPathArray();
        let buffer = Buffer.alloc(1 + pathArray.length * 4);
        buffer[0] = pathArray.length;
        pathArray.forEach((element, index) => {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        return buffer;
    }
}
exports.default = TezosLedgerConnector;
//# sourceMappingURL=TezosLedgerConnector.js.map