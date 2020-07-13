import { KeyStore } from '../../../types/wallet/KeyStore';
export declare namespace CryptonomicNameServiceHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function registerName(server: string, keystore: KeyStore, contract: string, name: string, resolver: string, registrationPeriod: number, registrationFee: number, operationFee: number, freight?: number, gas?: number): Promise<string>;
    function transferNameOwnership(server: string, keystore: KeyStore, contract: string, name: string, newNameOwner: string, fee: number, freight?: number, gas?: number, derivationPath?: string): Promise<string>;
    function updateResolver(server: string, keystore: KeyStore, contract: string, name: string, resolver: string, fee: number, freight?: number, gas?: number): Promise<string>;
    function updateRegistrationPeriod(server: string, keystore: KeyStore, contract: string, name: string, newRegistrationPeriod: number, registrationFee: number, operationFee: number, freight?: number, gas?: number): Promise<string>;
    function deleteName(server: string, keystore: KeyStore, contract: string, name: string, fee: number, freight?: number, gas?: number): Promise<string>;
    function getNameForAddress(server: string, mapid: number, address: string): Promise<any>;
    function getNameInfo(server: string, mapid: number, name: string): Promise<any>;
    function getSimpleStorage(server: string, contract: string): Promise<{
        nameMap: number;
        addressMap: number;
        manager: string;
        interval: number;
        maxDuration: number;
        intervalFee: number;
    }>;
}
