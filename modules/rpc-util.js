const request = require('request');
const docker_machine_ip = require('docker-ip');

class RpcRequest {

    static fetchBalance(provider, accountHash) {
        return new Promise(function(resolve, reject) {
            let URL = `${provider}/chains/main/blocks/head/context/contracts/${accountHash}/balance`;

            request(URL, function (error, response, body) {
                if(error) {
                    reject(error);
                } else {
                    try {
                        let balance = JSON.parse(body);
                        resolve(balance);
                    } catch(error) {
                        reject(error);
                    }
                }
            });
        });
    }

    static checkNodeStatus(provider) {
        if(process.platform.includes('win')) {
            provider = docker_machine_ip();
        }
        return new Promise(function(resolve, reject) {
            request(`${provider}/chains/main/blocks/head/protocols`, function (error, response, body) {
                if(error){
                    reject(error);
                } else {
                    try {
                        let statusData = JSON.parse(body);
                        resolve(statusData);
                    } catch(error) {
                        reject(error);
                    }
                }
            });
        });
    }
    
}

module.exports = { RpcRequest };