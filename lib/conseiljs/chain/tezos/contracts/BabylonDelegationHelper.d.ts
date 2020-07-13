import { KeyStore } from '../../../types/wallet/KeyStore';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
export declare namespace BabylonDelegationHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function verifyScript(script: string): boolean;
    function getSimpleStorage(server: string, address: string): Promise<{
        administrator: string;
    }>;
    function setDelegate(server: string, keyStore: KeyStore, contract: string, delegate: string, fee: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function unSetDelegate(server: string, keyStore: KeyStore, contract: string, fee: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function withdrawDelegatedFunds(server: string, keyStore: KeyStore, contract: string, fee: number, amount: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendDelegatedFunds(server: string, keyStore: KeyStore, contract: string, fee: number, amount: number, derivationPath: string | undefined, destination: string): Promise<TezosTypes.OperationResult>;
    function depositDelegatedFunds(server: string, keyStore: KeyStore, contract: string, fee: number, amount: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function deployManagerContract(server: string, keyStore: KeyStore, delegate: string, fee: number, amount: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
}
