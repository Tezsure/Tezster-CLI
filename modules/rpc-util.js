const request = require('request');

class RpcRequest {

    static fetchBalance(provider, accountHash) {
        return new Promise(function(resolve, reject) {
            var URL = `${provider}/chains/main/blocks/head/context/contracts/${accountHash}/balance`;

            request(URL, function (error, response, body) {
                if(error) {
                    reject(error);
                }
                else {
                    try {
                        resolve(body);
                    }
                    catch(error) {
                        reject(error);
                    }
                }
            });
        });
    }

    static checkNodeStatus(provider) {
        return new Promise(function(resolve, reject) {
            request(`${provider}/chains/main/blocks/head/protocols`, function (error, response, body) {
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