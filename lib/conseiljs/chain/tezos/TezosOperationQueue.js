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
const TezosConstants_1 = require("../../types/tezos/TezosConstants");
const TezosNodeReader_1 = require("./TezosNodeReader");
const TezosNodeWriter_1 = require("./TezosNodeWriter");
const LoggerSelector_1 = __importDefault(require("../../utils/LoggerSelector"));
const log = LoggerSelector_1.default.getLogger();
class TezosOperationQueue {
    constructor(server, derivationPath, keyStore, delay) {
        this.triggerTimestamp = 0;
        this.server = server;
        this.keyStore = keyStore;
        this.derivationPath = derivationPath;
        this.delay = delay;
        this.operations = [];
    }
    static createQueue(server, derivationPath, keyStore, delay = TezosConstants_1.TezosConstants.DefaultBatchDelay) {
        return new TezosOperationQueue(server, derivationPath, keyStore, delay);
    }
    addOperations(...operations) {
        if (this.operations.length === 0) {
            this.triggerTimestamp = Date.now();
            setTimeout(() => { this.sendOperations(); }, this.delay * 1000);
        }
        operations.forEach(o => this.operations.push(o));
    }
    getStatus() {
        return this.operations.length;
    }
    sendOperations() {
        return __awaiter(this, void 0, void 0, function* () {
            let counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(this.server, this.keyStore.publicKeyHash)) + 1;
            let ops = [];
            const queueLength = this.operations.length;
            for (let i = 0; i < queueLength; i++) {
                let o = this.operations.shift();
                if (o.counter) {
                    o.counter = `${counter++}`;
                }
                ops.push(o);
            }
            if (this.operations.length > 0) {
                this.triggerTimestamp = Date.now();
                setTimeout(() => { this.sendOperations(); }, this.delay * 1000);
            }
            try {
                yield TezosNodeWriter_1.TezosNodeWriter.sendOperation(this.server, ops, this.keyStore, this.derivationPath);
            }
            catch (error) {
                log.error(`Error sending queued operations: ${error}`);
            }
        });
    }
}
exports.TezosOperationQueue = TezosOperationQueue;
//# sourceMappingURL=TezosOperationQueue.js.map