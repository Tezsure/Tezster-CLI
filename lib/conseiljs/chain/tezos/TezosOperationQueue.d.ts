import { Operation } from '../../types/tezos/TezosP2PMessageTypes';
import { KeyStore } from '../../types/wallet/KeyStore';
export declare class TezosOperationQueue {
    readonly server: string;
    readonly derivationPath: string;
    readonly operations: Operation[];
    readonly keyStore: KeyStore;
    readonly delay: number;
    triggerTimestamp: number;
    private constructor();
    static createQueue(server: string, derivationPath: string, keyStore: KeyStore, delay?: number): TezosOperationQueue;
    addOperations(...operations: Operation[]): void;
    getStatus(): number;
    private sendOperations;
}
