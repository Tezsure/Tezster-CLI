import Transport from "@ledgerhq/hw-transport";
export declare enum Curve {
    ED25519 = 0,
    SECP256K1 = 1,
    SECP256R1 = 2
}
export declare enum Instruction {
    INS_VERSION = 0,
    INS_GET_PUBLIC_KEY = 2,
    INS_PROMPT_PUBLIC_KEY = 3,
    INS_SIGN = 4,
    INS_SIGN_UNSAFE = 5
}
export default class TezosLedgerConnector {
    transport: Transport<any>;
    constructor(transport: Transport<any>);
    getAddress(path: string, prompt?: boolean, curve?: Curve): Promise<string>;
    signOperation(path: string, hex: string, curve?: Curve): Promise<string>;
    signHex(path: string, hex: string, curve?: Curve): Promise<string>;
    getVersionString(): Promise<string>;
    private sign;
    private pathToBuffer;
}
