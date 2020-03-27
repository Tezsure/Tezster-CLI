export declare namespace TezosLanguageUtil {
    export function hexToMicheline(hex: string): codeEnvelope;
    export function translateMichelsonToMicheline(code: string): string;
    export function translateParameterMichelsonToMicheline(code: string): string;
    export function translateMichelsonToHex(code: string): string;
    export function translateMichelineToHex(code: string): string;
    export function preProcessMichelsonScript(code: string): string[];
    export function normalizeMichelineWhiteSpace(fragment: string): string;
    export function stripComments(fragment: string): string;
    interface codeEnvelope {
        code: string;
        consumed: number;
    }
    export {};
}
