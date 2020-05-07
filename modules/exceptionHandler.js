const Logger = require('./logger');
const { Helper } = require('./helper');

class ExceptionHandler {

    static contractException(commandType, error) {

        switch(commandType) {
            case 'deploy':
                commandType = 'deploying the contract';
                break;
            case 'invoke':
                commandType = 'calling the contract';
                break;
            default:
                commandType = 'fetching contract storage value';
        }

        if(error.toString().includes('Unexpected word token')) {
            let parseError = `${error}`.indexOf('Instead, ');
            Logger.error(`${error}`.substring(0, parseError != -1  ? parseError : `${error}`.length));
        } 
        else if(error.toString().includes(`empty_implicit_contract`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Account is not yet revealed on the blockchain. You can reveal the account by sending some tezos to the account.`);
        } 
        else if(error.toString().includes(`empty_transaction`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `please wait.... contract '${contractAddress}' might take some time to get deployed on the tezos network`);;
        } 
        else if(error.toString().includes('with 404 and Not Found')) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `please wait.... contract '${contractAddress}' might take some time to get deployed on the tezos network`);
        } 
        else if(error.toString().includes(`connect ECONNREFUSED`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Error occurred while establishing the connection with node provider....`);
        } 
        else if(error.toString().includes(`Only absolute URLs are supported`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Current provider URL is not supported by network provider....`);
        } 
        else if(error.toString().includes(`getaddrinfo ENOTFOUND`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Current provider URL is not supported by network provider....`);
        } 
        else if(error.toString().includes(`Only HTTP(S) protocols are supported`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Current provider URL is not supported by network provider....`);
        } 
        else if(error.toString().includes(`Cannot read property '0' of undefined`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Current provider URL is not supported by network provider....`);
        } 
        else {
            Logger.error(`Error occurred while ${commandType}:\n${error}`);
        }

    }

    static transactionException(commandType, error) {

        switch(commandType) {
            case 'transfer':
                commandType = 'transferring tez';
                break;
            case 'activateAccount':
                commandType = 'activating account';
                break;
            default:
                commandType = 'fetching balance';
        }

        if(error.toString().includes(`checksum`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}:${error}`, `Account doesn't  exists or not revealed on the network.... To list down all accounts run 'tezster list-accounts'`);
        } 
        else if(error.toString().includes(`empty_implicit_contract`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}:${error}`, `Account is not yet revealed on the blockchain. You can reveal the account by sending some tezos to the account.`);
        } 
        else if(error.toString().includes(`connect ECONNREFUSED`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Error occurred while establishing the connection with node provider....`);
        }
        else if(error.toString().includes(`Only absolute URLs are supported`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Current provider URL is not supported by network provider....`);
        } 
        else if(error.toString().includes(`getaddrinfo ENOTFOUND`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Current provider URL is not supported by network provider....`);
        } 
        else if(error.toString().includes(`Invalid`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Current provider URL is not supported by network provider....`);
        } 
        else if(error.toString().includes(`Unexpected end of JSON input`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `Make sure account '${account}' is revealed on the current provider....`);
        } 
        else {
            Logger.error(`Error occurred while ${commandType}:\n${error}`);
        }

    }

}

module.exports = { ExceptionHandler };