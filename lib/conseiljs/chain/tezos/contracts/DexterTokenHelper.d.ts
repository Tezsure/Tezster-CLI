export declare namespace DexterTokenHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function getBasicStorage(server: string, address: string): Promise<{
        mapid: number;
        totalSupply: number;
    }>;
    function getAddressRecord(server: string, mapid: number, account: string): Promise<{
        allowances: any;
        balance: number;
    } | undefined>;
    function deployContract(server: string, manager: string, supply: number): Promise<void>;
}
