export declare class ServiceRequestError extends Error {
    httpStatus: number;
    httpMessage: string;
    serverURL: string;
    data: string | null;
    constructor(httpStatus: number, httpMessage: string, serverURL: string, data: string | null);
}
export declare class ServiceResponseError extends Error {
    httpStatus: number;
    httpMessage: string;
    serverURL: string;
    data: string | null;
    response: any;
    constructor(httpStatus: number, httpMessage: string, serverURL: string, data: string | null, response: any);
}
