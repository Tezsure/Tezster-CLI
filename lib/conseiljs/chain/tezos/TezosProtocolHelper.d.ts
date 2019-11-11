import { KeyStore } from '../../types/wallet/KeyStore';
import * as TezosTypes from '../../types/tezos/TezosChainTypes';
export declare namespace TezosProtocolHelper {
    function setDelegate(server: string, keyStore: KeyStore, delegator: string, delegate: string, fee: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function unSetDelegate(server: string, keyStore: KeyStore, delegator: string, fee: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function withdrawDelegatedFunds(server: string, keyStore: KeyStore, delegator: string, fee: number, amount: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function depositDelegatedFunds(server: string, keyStore: KeyStore, delegator: string, fee: number, amount: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function deployManagerContract(server: string, keyStore: KeyStore, delegate: string, fee: number, amount: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
}
