"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceRequestError extends Error {
    constructor(httpStatus, httpMessage, serverURL, data) {
        super();
        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.serverURL = serverURL;
        this.data = data;
    }
}
exports.ServiceRequestError = ServiceRequestError;
class ServiceResponseError extends Error {
    constructor(httpStatus, httpMessage, serverURL, data, response) {
        super();
        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.serverURL = serverURL;
        this.data = data;
        this.response = response;
    }
}
exports.ServiceResponseError = ServiceResponseError;
//# sourceMappingURL=ErrorTypes.js.map