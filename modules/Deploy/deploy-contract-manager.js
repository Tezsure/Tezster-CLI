const { config, findKeyObj, getKeys, outputError } = require("../../tezster-manager");
const ConseilJS = '../../lib/conseiljs';

async function deployContract(contractLabel, contractPath, initValue, account) {
    const fs = require("fs");
    const conseiljs = require(ConseilJS);
    const tezosNode = config.provider;  
    
    const keys = getKeys(account);
    if(!keys) {
      return outputError(`Couldn't find keys for given account.
        Please make sure the account exists and added to tezster. Run 'tezster list-accounts to get all accounts`);
    }
    const keystore = {
        publicKey: keys.pk,
        privateKey: keys.sk,
        publicKeyHash: keys.pkh,
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
  
    let contractObj = findKeyObj(config.contracts, contractLabel);
    if (contractObj) {
      return outputError(`This contract label is already in use. Please use a different one.`);
    }
  
    try {
      const contract = fs.readFileSync(contractPath, 'utf8');
      const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
                                tezosNode, keystore, 0, undefined,
                                100000, '', 1000, 100000, 
                                contract, initValue, conseiljs.TezosParameterFormat.Michelson);
      if (result.results) {
        switch(result.results.contents[0].metadata.operation_result.status) {
          case 'applied':
              let opHash = result.operationGroupID.slice(1,result.operationGroupID.length-2);
              opHash = eztz.contract.hash(opHash);
              addContract(contractLabel, opHash , keys.pkh);
              return output(`contract ${contractLabel} has been deployed at ${opHash}`);
  
          case 'failed':
          default:
              return outputError(`Contract deployment has failed : ${JSON.stringify(result.results.contents[0].metadata.operation_result)}`)
        }
      }
      return outputError(`Contract deployment has failed : ${JSON.stringify(result)}`);
    } catch(error) {
      return outputError(error);
    }
  }

module.exports = { deployContract };