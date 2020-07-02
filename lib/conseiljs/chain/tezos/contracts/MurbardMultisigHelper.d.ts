import { KeyStore } from '../../../types/wallet/KeyStore';
export declare namespace MurbardMultisigHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function verifyScript(script: string): boolean;
    function getSimpleStorage(server: string, address: string): Promise<{
        counter: number;
        threshold: number;
        keys: string[];
    }>;
    function deployContract(server: string, keyStore: KeyStore, delegate: string, fee: number, amount: number, counter: number, threshold: number, keys: string[]): Promise<string>;
}
