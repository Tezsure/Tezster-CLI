/// <reference types="node" />
export declare namespace CryptoUtils {
    function generateSaltForPwHash(): Promise<Buffer>;
    function encryptMessage(message: string, passphrase: string, salt: Buffer): Promise<Buffer>;
    function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer): Promise<string>;
    function simpleHash(payload: Buffer, length: number): Buffer;
    function generateKeys(seed: Buffer): Promise<{
        privateKey: any;
        publicKey: any;
    }>;
    function recoverPublicKey(secretKey: Buffer): Promise<{
        privateKey: any;
        publicKey: any;
    }>;
    function signDetached(payload: Buffer, secretKey: Buffer): Promise<Buffer>;
    function checkSignature(signature: Buffer, payload: Buffer, publicKey: Buffer): Promise<boolean>;
    function twoByteHex(n: number): string;
    function fromByteHex(s: string): number;
}
