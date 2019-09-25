import * as TezosRPCTypes from '../../types/tezos/TezosRPCResponseTypes';
export declare namespace TezosNodeReader {
    function getBlock(server: string, hash?: string, chainid?: string): Promise<TezosRPCTypes.TezosBlock>;
    function getBlockHead(server: string): Promise<TezosRPCTypes.TezosBlock>;
    function getAccountForBlock(server: string, blockHash: string, accountHash: string, chainid?: string): Promise<TezosRPCTypes.Contract>;
    function getCounterForAccount(server: string, accountHash: string, chainid?: string): Promise<number>;
    function getSpendableBalanceForAccount(server: string, accountHash: string, chainid?: string): Promise<number>;
    function getAccountManagerForBlock(server: string, blockHash: string, accountHash: string, chainid?: string): Promise<TezosRPCTypes.ManagerKey>;
    function isImplicitAndEmpty(server: string, accountHash: string): Promise<boolean>;
    function isManagerKeyRevealedForAccount(server: string, accountHash: string): Promise<boolean>;
}
