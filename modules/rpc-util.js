const request = require('request'),
      os = require('os'),
      docker_machine_ip = require('docker-ip'),
      { WIN_OS_PLATFORM, WIN_WSL_OS_RELEASE } = require('./cli-constants');

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
            if(os.platform().includes(WIN_OS_PLATFORM) || os.release().includes(WIN_WSL_OS_RELEASE)) {
                let current_docker_machine_ip;
                try { 
                    current_docker_machine_ip = docker_machine_ip();
                } catch(error) {
                    reject(error);
                }
                if(current_docker_machine_ip.includes('localhost')) {
                    reject('docker machine is not running....');
                    return;
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