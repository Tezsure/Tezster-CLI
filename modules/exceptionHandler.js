const Logger = require('./logger'),
      { Helper } = require('./helper');

const EMPTY_IMPLICIT_CONTRACT = 'Account is not yet revealed on the blockchain. You can reveal the account by sending some tezos to the account.',
      EMPTY_TRANSACTION = `please wait.... contract might take some time to get deployed on the tezos network`,
      NOT_FOUND_404 = `make sure current network is same as the network smart contract got deployed....`,
      CONNECT_ECONNREFUSED = 'Error occurred while establishing the connection with node provider....',
      ABSOLUTE_URL_ARE_SUPPORTED = 'Current provider URL is not supported by network provider....',
      GETADDRINFO = 'Current provider URL is not supported by network provider....',
      HTTP_PROTOCOL = 'Current provider URL is not supported by network provider....',
      CANNOT_READ_PROPERTY = 'Current provider URL is not supported by network provider....',
      CHECKSUM = `Account doesn't  exists or not revealed on the network.... To list down all accounts run 'tezster list-accounts'.`,
      INVALID = 'Current provider URL is not supported by network provider....',
      UNEXPECTED_END_OF_JSON_INPUT = 'Make sure account is revealed on the current provider....';

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
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${EMPTY_IMPLICIT_CONTRACT}`);
        } 
        else if(error.toString().includes(`empty_transaction`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${EMPTY_TRANSACTION}`);;
        } 
        else if(error.toString().includes('with 404 and Not Found')) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${NOT_FOUND_404}`);
        } 
        else if(error.toString().includes(`connect ECONNREFUSED`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${CONNECT_ECONNREFUSED}`);
        } 
        else if(error.toString().includes(`Only absolute URLs are supported`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${ABSOLUTE_URL_ARE_SUPPORTED}`);
        } 
        else if(error.toString().includes(`getaddrinfo`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${GETADDRINFO}`);
        } 
        else if(error.toString().includes(`Only HTTP(S) protocols are supported`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${HTTP_PROTOCOL}`);
        } 
        else if(error.toString().includes(`Cannot read property '0' of undefined`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${CANNOT_READ_PROPERTY}`);
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
            Helper.errorLogHandler(`Error occurred while ${commandType}:${error}`, `${CHECKSUM}`);
        } 
        else if(error.toString().includes(`empty_implicit_contract`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}:${error}`, `${EMPTY_IMPLICIT_CONTRACT}`);
        } 
        else if(error.toString().includes(`connect ECONNREFUSED`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${CONNECT_ECONNREFUSED}`);
        }
        else if(error.toString().includes(`Only absolute URLs are supported`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${ABSOLUTE_URL_ARE_SUPPORTED}`);
        } 
        else if(error.toString().includes(`getaddrinfo`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${GETADDRINFO}`);
        } 
        else if(error.toString().includes(`Invalid`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${INVALID}`);
        } 
        else if(error.toString().includes(`Unexpected end of JSON input`)) {
            Helper.errorLogHandler(`Error occurred while ${commandType}: ${error}`, `${UNEXPECTED_END_OF_JSON_INPUT}`);
        } 
        else {
            Logger.error(`Error occurred while ${commandType}:\n${error}`);
        }

    }

}

module.exports = { ExceptionHandler };