const request = require('request'),
      docker_machine_ip = require('docker-ip'),
      { Helper } = require('./helper');
const { NODE_TYPE, TZSTATS_NODE_TYPE } = require('./cli-constants');

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

    static checkNodeStatusForLocalNodes(provider) {
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
            
            request(`${provider}/chains/main/blocks/head`, function (error, response, body) {
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
    
    static fetchBlockDetailsForRemoteNodes(provider) {
        provider = provider.includes('mainnet') ? 'https://api.tzstats.com' : provider.includes('edo') ? `https://api.${TZSTATS_NODE_TYPE.EDONET}.tzstats.com`: `https://api.${TZSTATS_NODE_TYPE.TESTNET}.tzstats.com`;
        return Promise.all(
            [ `${provider}/explorer/block/head/op`, `${provider}/explorer/config/head` ].map((url, i)=> {   
                return new Promise(function(resolve, reject){
                    try {
                        request.get({ url: url }, function(error, response, body) {
                        if(error) {
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
                    } catch(error) {
                        reject(error);
                    }
                });        
            })
        );
    }
    
}

module.exports = { RpcRequest };