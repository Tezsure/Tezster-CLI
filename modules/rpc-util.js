const request = require('request');
      docker_machine_ip = require('docker-ip'),
      { Helper } = require('./helper');

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
        return new Promise(function(resolve, reject) {
            if(Helper.isWindows()) {
                let current_docker_machine_ip;
                try { 
                    current_docker_machine_ip = docker_machine_ip();
                } catch(error) {
                    reject(error);
                }
                provider = provider.replace('localhost', current_docker_machine_ip);
            }
            
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