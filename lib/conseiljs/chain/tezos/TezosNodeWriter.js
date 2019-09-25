"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
const KeyStore_1 = require("../../types/wallet/KeyStore");
const TezosTypes = __importStar(require("../../types/tezos/TezosChainTypes"));
const TezosConstants_1 = require("../../types/tezos/TezosConstants");
const TezosNodeReader_1 = require("./TezosNodeReader");
const TezosMessageCodec_1 = require("./TezosMessageCodec");
const TezosMessageUtil_1 = require("./TezosMessageUtil");
const TezosLanguageUtil_1 = require("./TezosLanguageUtil");
const TezosOperationQueue_1 = require("./TezosOperationQueue");
const CryptoUtils_1 = require("../../utils/CryptoUtils");
const FetchSelector_1 = __importDefault(require("../../utils/FetchSelector"));
const fetch = FetchSelector_1.default.getFetch();
const DeviceSelector_1 = __importDefault(require("../../utils/DeviceSelector"));
let LedgerUtils = DeviceSelector_1.default.getLedgerUtils();
const LoggerSelector_1 = __importDefault(require("../../utils/LoggerSelector"));
const log = LoggerSelector_1.default.getLogger();
let operationQueues = {};
var TezosNodeWriter;
(function (TezosNodeWriter) {
    function performPostRequest(server, command, payload = {}) {
        const url = `${server}/${command}`;
        const payloadStr = JSON.stringify(payload);
        log.debug(`TezosNodeWriter.performPostRequest sending ${payloadStr}\n->\n${url}`);
        return fetch(url, { method: 'post', body: payloadStr, headers: { 'content-type': 'application/json' } });
    }
    function performBytePostRequest(server, command, payload) {
        const url = `${server}/${command}`;
        log.debug(`TezosNodeWriter.performPostRequest sending bytes\n->\n${url}`);
        return fetch(url, { method: 'post', body: payload, headers: { 'content-type': 'application/octet-stream' } });
    }
    function signOperationGroup(forgedOperation, keyStore, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const watermarkedForgedOperationBytesHex = TezosConstants_1.TezosConstants.OperationGroupWatermark + forgedOperation;
            let opSignature;
            switch (keyStore.storeType) {
                case KeyStore_1.StoreType.Hardware:
                    opSignature = yield LedgerUtils.signTezosOperation(derivationPath, watermarkedForgedOperationBytesHex);
                    break;
                default:
                    const hashedWatermarkedOpBytes = CryptoUtils_1.CryptoUtils.simpleHash(Buffer.from(watermarkedForgedOperationBytesHex, 'hex'), 32);
                    const privateKeyBytes = TezosMessageUtil_1.TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, 'edsk');
                    opSignature = yield CryptoUtils_1.CryptoUtils.signDetached(hashedWatermarkedOpBytes, privateKeyBytes);
            }
            const hexSignature = TezosMessageUtil_1.TezosMessageUtils.readSignatureWithHint(opSignature, 'edsig').toString();
            const signedOpBytes = Buffer.concat([Buffer.from(forgedOperation, 'hex'), Buffer.from(opSignature)]);
            return { bytes: signedOpBytes, signature: hexSignature.toString() };
        });
    }
    TezosNodeWriter.signOperationGroup = signOperationGroup;
    function forgeOperations(branch, operations) {
        log.debug('TezosNodeWriter.forgeOperations:');
        log.debug(operations);
        let encoded = TezosMessageUtil_1.TezosMessageUtils.writeBranch(branch);
        operations.forEach(m => encoded += TezosMessageCodec_1.TezosMessageCodec.encodeOperation(m));
        return encoded;
    }
    TezosNodeWriter.forgeOperations = forgeOperations;
    function forgeOperationsRemotely(server, blockHead, operations, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            log.debug('TezosNodeWriter.forgeOperations:');
            log.debug(operations);
            log.warn('forgeOperationsRemotely() is not intrinsically trustless');
            const response = yield performPostRequest(server, `chains/${chainid}/blocks/head/helpers/forge/operations`, { branch: blockHead.hash, contents: operations });
            const forgedOperation = yield response.text();
            const ops = forgedOperation.replace(/\n/g, '').replace(/['"]+/g, '');
            let optypes = Array.from(operations.map(o => o["kind"]));
            let validate = false;
            for (let t in optypes) {
                validate = ['reveal', 'transaction', 'delegation', 'origination'].includes(t);
                if (validate) {
                    break;
                }
            }
            if (validate) {
                const decoded = TezosMessageCodec_1.TezosMessageCodec.parseOperationGroup(ops);
                for (let i = 0; i < operations.length; i++) {
                    const clientop = operations[i];
                    const serverop = decoded[i];
                    if (clientop['kind'] === 'transaction') {
                        if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.amount !== clientop['amount'] || serverop.destination !== clientop['destination']) {
                            throw new Error('Forged transaction failed validation.');
                        }
                    }
                    else if (clientop['kind'] === 'delegation') {
                        if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.delegate !== clientop['delegate']) {
                            throw new Error('Forged delegation failed validation.');
                        }
                    }
                    else if (clientop['kind'] === 'origination') {
                        if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.balance !== clientop['balance'] || serverop.spendable !== clientop['spendable'] || serverop.delegatable !== clientop['delegatable'] || serverop.delegate !== clientop['delegate'] || serverop.script !== undefined) {
                            throw new Error('Forged origination failed validation.');
                        }
                    }
                }
            }
            return ops;
        });
    }
    TezosNodeWriter.forgeOperationsRemotely = forgeOperationsRemotely;
    function applyOperation(server, branch, protocol, operations, signedOpGroup, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = [{
                    protocol: protocol,
                    branch: branch,
                    contents: operations,
                    signature: signedOpGroup.signature
                }];
            const response = yield performPostRequest(server, `chains/${chainid}/blocks/head/helpers/preapply/operations`, payload);
            const text = yield response.text();
            try {
                log.debug(`TezosNodeWriter.applyOperation received ${text}`);
                const json = JSON.parse(text);
                return json;
            }
            catch (err) {
                log.error(`TezosNodeWriter.applyOperation failed to parse response`);
                throw new Error(`Could not parse JSON response from chains/${chainid}/blocks/head/helpers/preapply/operation: '${text}' for ${payload}`);
            }
        });
    }
    TezosNodeWriter.applyOperation = applyOperation;
    function checkAppliedOperationResults(appliedOp) {
        const validAppliedKinds = new Set(['activate_account', 'reveal', 'transaction', 'origination', 'delegation']);
        const firstAppliedOp = appliedOp[0];
        if (firstAppliedOp.kind != null && !validAppliedKinds.has(firstAppliedOp.kind)) {
            log.error(`TezosNodeWriter.checkAppliedOperationResults failed with ${firstAppliedOp.id}`);
            throw new Error(`Could not apply operation because ${firstAppliedOp.id}`);
        }
        for (const op of firstAppliedOp.contents) {
            if (!validAppliedKinds.has(op.kind)) {
                log.error(`TezosNodeWriter.checkAppliedOperationResults failed with ${op.metadata}`);
                throw new Error(`Could not apply operation because: ${op.metadata}`);
            }
        }
    }
    function injectOperation(server, signedOpGroup, chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield performPostRequest(server, `injection/operation?chain=${chainid}`, signedOpGroup.bytes.toString('hex'));
            const injectedOperation = yield response.text();
            return injectedOperation;
        });
    }
    TezosNodeWriter.injectOperation = injectOperation;
    function sendOperation(server, operations, keyStore, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const forgedOperationGroup = forgeOperations(blockHead.hash, operations);
            const signedOpGroup = yield signOperationGroup(forgedOperationGroup, keyStore, derivationPath);
            const appliedOp = yield applyOperation(server, blockHead.hash, blockHead.protocol, operations, signedOpGroup);
            checkAppliedOperationResults(appliedOp);
            const injectedOperation = yield injectOperation(server, signedOpGroup);
            return { results: appliedOp[0], operationGroupID: injectedOperation };
        });
    }
    TezosNodeWriter.sendOperation = sendOperation;
    function queueOperation(server, operations, keyStore, derivationPath = '', batchDelay = 25) {
        const k = blakejs.blake2s(`${server}${keyStore.publicKeyHash}${derivationPath}`, null, 16);
        if (!!!operationQueues[k]) {
            operationQueues[k] = TezosOperationQueue_1.TezosOperationQueue.createQueue(server, derivationPath, keyStore, batchDelay);
        }
        operationQueues[k].addOperations(...operations);
    }
    TezosNodeWriter.queueOperation = queueOperation;
    function getQueueStatus(server, keyStore, derivationPath = '') {
        const k = blakejs.blake2s(`${server}${keyStore.publicKeyHash}${derivationPath}`, null, 16);
        if (operationQueues[k]) {
            return operationQueues[k].getStatus();
        }
        return -1;
    }
    TezosNodeWriter.getQueueStatus = getQueueStatus;
    function appendRevealOperation(server, keyStore, accountHash, accountOperationIndex, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const isKeyRevealed = yield TezosNodeReader_1.TezosNodeReader.isManagerKeyRevealedForAccount(server, accountHash);
            const counter = accountOperationIndex + 1;
            if (!isKeyRevealed) {
                const revealOp = {
                    kind: 'reveal',
                    source: accountHash,
                    fee: '0',
                    counter: counter.toString(),
                    gas_limit: '10600',
                    storage_limit: '0',
                    public_key: keyStore.publicKey
                };
                operations.forEach((operation, index) => {
                    const c = accountOperationIndex + 2 + index;
                    operation.counter = c.toString();
                });
                return [revealOp, ...operations];
            }
            return operations;
        });
    }
    TezosNodeWriter.appendRevealOperation = appendRevealOperation;
    function sendTransactionOperation(server, keyStore, to, amount, fee, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash)) + 1;
            const transaction = {
                destination: to,
                amount: amount.toString(),
                storage_limit: TezosConstants_1.TezosConstants.DefaultTransactionStorageLimit + '',
                gas_limit: TezosConstants_1.TezosConstants.DefaultTransactionGasLimit + '',
                counter: counter.toString(),
                fee: fee.toString(),
                source: keyStore.publicKeyHash,
                kind: 'transaction'
            };
            const operations = yield appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [transaction]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendTransactionOperation = sendTransactionOperation;
    function sendDelegationOperation(server, keyStore, delegator, delegate, fee = TezosConstants_1.TezosConstants.DefaultDelegationFee, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, delegator)) + 1;
            const delegation = {
                kind: 'delegation',
                source: delegator,
                fee: fee.toString(),
                counter: counter.toString(),
                storage_limit: TezosConstants_1.TezosConstants.DefaultDelegationStorageLimit + '',
                gas_limit: TezosConstants_1.TezosConstants.DefaultDelegationStorageLimit + '',
                delegate: delegate
            };
            const operations = yield appendRevealOperation(server, keyStore, delegator, counter - 1, [delegation]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendDelegationOperation = sendDelegationOperation;
    function sendUndelegationOperation(server, keyStore, delegator, fee = TezosConstants_1.TezosConstants.DefaultDelegationFee, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            return sendDelegationOperation(server, keyStore, delegator, undefined, fee, derivationPath);
        });
    }
    TezosNodeWriter.sendUndelegationOperation = sendUndelegationOperation;
    function sendAccountOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee = TezosConstants_1.TezosConstants.DefaultAccountOriginationFee, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            return sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, TezosConstants_1.TezosConstants.DefaultAccountOriginationStorageLimit, TezosConstants_1.TezosConstants.DefaultAccountOriginationGasLimit);
        });
    }
    TezosNodeWriter.sendAccountOriginationOperation = sendAccountOriginationOperation;
    function sendContractOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage, codeFormat = TezosTypes.TezosParameterFormat.Micheline) {
        return __awaiter(this, void 0, void 0, function* () {
            if (spendable) {
                log.warn('As of protocol 004-Pt24m4xi, contracts with code cannot be "spendable"');
            }
            let parsedCode = undefined;
            let parsedStorage = undefined;
            if (codeFormat === TezosTypes.TezosParameterFormat.Michelson) {
                parsedCode = JSON.parse(TezosLanguageUtil_1.TezosLanguageUtil.translateMichelsonToMicheline(code));
                log.debug(`TezosNodeWriter.sendOriginationOperation code translation:\n${code}\n->\n${JSON.stringify(parsedCode)}`);
                parsedStorage = JSON.parse(TezosLanguageUtil_1.TezosLanguageUtil.translateMichelsonToMicheline(storage));
                log.debug(`TezosNodeWriter.sendOriginationOperation storage translation:\n${storage}\n->\n${JSON.stringify(parsedStorage)}`);
            }
            else if (codeFormat === TezosTypes.TezosParameterFormat.Micheline) {
                parsedCode = JSON.parse(code);
                parsedStorage = JSON.parse(storage);
            }
            return sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, parsedCode, parsedStorage);
        });
    }
    TezosNodeWriter.sendContractOriginationOperation = sendContractOriginationOperation;
    function sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage) {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash)) + 1;
            const origination = {
                kind: 'origination',
                source: keyStore.publicKeyHash,
                fee: fee.toString(),
                counter: counter.toString(),
                gas_limit: gas_limit.toString(),
                storage_limit: storage_limit.toString(),
                manager_pubkey: keyStore.publicKeyHash,
                balance: amount.toString(),
                spendable: spendable,
                delegatable: delegatable && !!delegate,
                delegate: delegate,
                script: code ? { code, storage } : undefined
            };
            const operations = yield appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [origination]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    function sendContractInvocationOperation(server, keyStore, to, amount, fee, derivationPath, storageLimit, gasLimit, parameters, parameterFormat = TezosTypes.TezosParameterFormat.Micheline) {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash)) + 1;
            let transaction = {
                destination: to,
                amount: amount.toString(),
                storage_limit: storageLimit.toString(),
                gas_limit: gasLimit.toString(),
                counter: counter.toString(),
                fee: fee.toString(),
                source: keyStore.publicKeyHash,
                kind: 'transaction'
            };
            if (!!parameters && parameters.trim().length > 0) {
                if (parameterFormat === TezosTypes.TezosParameterFormat.Michelson) {
                    const michelineParams = TezosLanguageUtil_1.TezosLanguageUtil.translateMichelsonToMicheline(parameters);
                    transaction.parameters = JSON.parse(michelineParams);
                }
                else if (parameterFormat === TezosTypes.TezosParameterFormat.Micheline) {
                    transaction.parameters = JSON.parse(parameters);
                }
            }
            const operations = yield appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [transaction]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendContractInvocationOperation = sendContractInvocationOperation;
    function sendContractPing(server, keyStore, to, fee, derivationPath, storageLimit, gasLimit) {
        return __awaiter(this, void 0, void 0, function* () {
            return sendContractInvocationOperation(server, keyStore, to, 0, fee, derivationPath, storageLimit, gasLimit, '');
        });
    }
    TezosNodeWriter.sendContractPing = sendContractPing;
    function sendKeyRevealOperation(server, keyStore, fee = TezosConstants_1.TezosConstants.DefaultKeyRevealFee, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash)) + 1;
            const revealOp = {
                kind: 'reveal',
                source: keyStore.publicKeyHash,
                fee: fee + '',
                counter: counter.toString(),
                gas_limit: '10000',
                storage_limit: '0',
                public_key: keyStore.publicKey
            };
            const operations = [revealOp];
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendKeyRevealOperation = sendKeyRevealOperation;
    function sendIdentityActivationOperation(server, keyStore, activationCode, derivationPath) {
        const activation = { kind: 'activate_account', pkh: keyStore.publicKeyHash, secret: activationCode };
        return sendOperation(server, [activation], keyStore, derivationPath);
    }
    TezosNodeWriter.sendIdentityActivationOperation = sendIdentityActivationOperation;
    function testOperation(server, operations, keyStore, derivationPath = '', chainid = 'main') {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const forgedOperationGroup = forgeOperations(blockHead.hash, operations);
            const signedOpGroup = yield signOperationGroup(forgedOperationGroup, keyStore, derivationPath);
            const response = yield performBytePostRequest(server, `chains/${chainid}/blocks/head/helpers/scripts/run_operation`, signedOpGroup.bytes);
            const responseText = yield response.text();
            const error = parseRPCError(responseText);
            if (!!error) {
                throw new Error(error);
            }
            const responseJSON = JSON.parse(responseText);
            let gas = 0;
            let storage = 0;
            for (let c of responseJSON['contents']) {
                try {
                    gas += parseInt(c['metadata']['operation_result']['consumed_gas']);
                    storage += parseInt(c['metadata']['operation_result']['paid_storage_size_diff']);
                }
                catch (_a) { }
            }
            return [gas, storage];
        });
    }
    TezosNodeWriter.testOperation = testOperation;
    function parseRPCError(response) {
        if (response.startsWith('Failed to parse the request body: ')) {
            return `Failed with ${response.slice(34)}`;
        }
        let responseJSON = {};
        try {
            responseJSON = JSON.parse(response);
        }
        catch (jsonParsingError) {
            return 'Could not parse response text as JSON.';
        }
        if (Array.isArray(responseJSON)) {
            let errorKind = '';
            try {
                errorKind = responseJSON[0]['kind'];
            }
            catch (_a) { }
            let errorType = '';
            try {
                errorType = responseJSON[0]['id'].toString().split('.').slice(-2).join(' ').replace(/_/g, ' ');
            }
            catch (_b) { }
            let errorMessage = '';
            try {
                errorMessage = responseJSON[0]['error'];
            }
            catch (_c) { }
            return `Failed with ${[errorKind, errorType, errorMessage].filter(e => e !== '').join(', ')}`;
        }
        else {
            let errors = '';
            for (let c of responseJSON['contents']) {
                const operationStatus = c['metadata']['operation_result']['status'];
                if (operationStatus !== 'applied') {
                    const errorType = c['metadata']['operation_result']['errors'].toString().split('.').slice(-2).join(' ').replace(/_/g, ' ');
                    c += `Operation ${operationStatus} with ${errorType}\n`;
                }
            }
            errors = errors.trim();
            if (errors.length > 0) {
                return errors;
            }
        }
        return undefined;
    }
})(TezosNodeWriter = exports.TezosNodeWriter || (exports.TezosNodeWriter = {}));
//# sourceMappingURL=TezosNodeWriter.js.map