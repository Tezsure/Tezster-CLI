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
const TezosNodeWriter_1 = require("../TezosNodeWriter");
const TezosTypes = __importStar(require("../../../types/tezos/TezosChainTypes"));
var CryptonomicNameServiceHelper;
(function (CryptonomicNameServiceHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, 'head', address);
            if (!!!contract.script) {
                throw new Error(`No code found at ${address}`);
            }
            const k = Buffer.from(blakejs.blake2s(contract['script'].toString(), null, 16)).toString('hex');
            if (k !== 'c020219e31ee3b462ed93c33124f117f') {
                throw new Error(`Contract at ${address} does not match the expected code hash: ${k}, 'c020219e31ee3b462ed93c33124f117f'`);
            }
            return true;
        });
    }
    CryptonomicNameServiceHelper.verifyDestination = verifyDestination;
    function registerName(server, keystore, contract, name, resolver, registrationPeriod, registrationFee, operationFee, freight, gas) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Pair ${registrationPeriod} (Pair "${name}" "${resolver}"))`;
            if (!freight || !gas) {
                const cost = yield TezosNodeWriter_1.TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, registrationFee, operationFee, 6000, 500000, 'registerName', parameters, TezosTypes.TezosParameterFormat.Michelson);
                if (!freight) {
                    freight = Number(cost['storageCost']) || 0;
                }
                if (!gas) {
                    gas = Number(cost['gas']) + 300;
                }
            }
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, registrationFee, operationFee, keystore.derivationPath, 6000, 300000, 'registerName', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    CryptonomicNameServiceHelper.registerName = registerName;
    function transferNameOwnership(server, keystore, contract, name, newNameOwner, fee, freight, gas, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Pair "${name}" "${newNameOwner}")`;
            if (!freight || !gas) {
                const cost = yield TezosNodeWriter_1.TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'transferNameOwnership', parameters, TezosTypes.TezosParameterFormat.Michelson);
                if (!freight) {
                    freight = Number(cost['storageCost']) || 0;
                }
                if (!gas) {
                    gas = Number(cost['gas']) + 300;
                }
            }
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, derivationPath, freight, gas, 'transferNameOwnership', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    CryptonomicNameServiceHelper.transferNameOwnership = transferNameOwnership;
    function updateResolver(server, keystore, contract, name, resolver, fee, freight, gas) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Pair "${name}" "${resolver}")`;
            if (!freight || !gas) {
                const cost = yield TezosNodeWriter_1.TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'updateResolver', parameters, TezosTypes.TezosParameterFormat.Michelson);
                if (!freight) {
                    freight = Number(cost['storageCost']) || 0;
                }
                if (!gas) {
                    gas = Number(cost['gas']) + 300;
                }
            }
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, 'updateResolver', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    CryptonomicNameServiceHelper.updateResolver = updateResolver;
    function updateRegistrationPeriod(server, keystore, contract, name, newRegistrationPeriod, registrationFee, operationFee, freight, gas) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Pair "${name}" ${newRegistrationPeriod})`;
            if (!freight || !gas) {
                const cost = yield TezosNodeWriter_1.TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, registrationFee, operationFee, 1000, 100000, 'updateRegistrationPeriod', parameters, TezosTypes.TezosParameterFormat.Michelson);
                if (!freight) {
                    freight = Number(cost['storageCost']) || 0;
                }
                if (!gas) {
                    gas = Number(cost['gas']) + 300;
                }
            }
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, registrationFee, operationFee, keystore.derivationPath, freight, gas, 'updateRegistrationPeriod', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    CryptonomicNameServiceHelper.updateRegistrationPeriod = updateRegistrationPeriod;
    function deleteName(server, keystore, contract, name, fee, freight, gas) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `"${name}"`;
            if (!freight || !gas) {
                const cost = yield TezosNodeWriter_1.TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contract, 0, fee, 1000, 100000, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
                if (!freight) {
                    freight = Number(cost['storageCost']) || 0;
                }
                if (!gas) {
                    gas = Number(cost['gas']) + 300;
                }
            }
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, 'deleteName', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    CryptonomicNameServiceHelper.deleteName = deleteName;
    function getNameForAddress(server, mapid, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(address, 'address'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            return jsonpath_plus_1.JSONPath({ path: '$.string', json: mapResult })[0];
        });
    }
    CryptonomicNameServiceHelper.getNameForAddress = getNameForAddress;
    function getNameInfo(server, mapid, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(name, 'string'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            return {
                name,
                owner: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[1].string', json: mapResult })[0],
                resolver: jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].string', json: mapResult })[0],
                registeredAt: new Date(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].string', json: mapResult })[0]),
                registrationPeriod: jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[0].int', json: mapResult })[0],
                modified: Boolean(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].prim', json: mapResult })[0])
            };
        });
    }
    CryptonomicNameServiceHelper.getNameInfo = getNameInfo;
    function getSimpleStorage(server, contract) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, contract);
            return {
                addressMap: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].int', json: storageResult })[0]),
                nameMap: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[0].int', json: storageResult })[0]),
                manager: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[0].string', json: storageResult })[0],
                interval: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[1].int', json: storageResult })[0]),
                maxDuration: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]),
                intervalFee: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0])
            };
        });
    }
    CryptonomicNameServiceHelper.getSimpleStorage = getSimpleStorage;
    function clearRPCOperationGroupHash(hash) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
})(CryptonomicNameServiceHelper = exports.CryptonomicNameServiceHelper || (exports.CryptonomicNameServiceHelper = {}));
//# sourceMappingURL=CryptonomicNameServiceHelper.js.map