const request = require('request');
const Logger = require('./logger');
const { Helper } = require('./helper');

class RpcRequest {

    static fetchBalance(provider, accountHash) {
        var URL = `${provider}/chains/main/blocks/head/context/contracts/${accountHash}/balance`;
        request(URL, function (error, response, body) {
            if(error) {
                Logger.error(`${error}`);
            }
            else {
                try {
                    var balance = JSON.parse(body);
                    Logger.info(Helper.formatTez(balance));
                }
                catch(error) {
                    Logger.error(`${error}`);
                }
            }
        });
    }

    static checkNodeStatus() {
        return new Promise(function(resolve, reject) {
            request('http://localhost:18731/chains/main/blocks/head/protocols', function (error, response, body) {
                if(error){
                    reject(error);
                } else {
                    var statusData = JSON.parse(body);
                    resolve(statusData);
                }
            });
        });
    }
    
}

module.exports = { RpcRequest };