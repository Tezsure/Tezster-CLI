const tezsterManager = require("../../tezster-manager");

async function listTransactions() {       
    await tezsterManager.loadTezsterConfig();    
    const config = tezsterManager.config;

    console.log(tezsterManager.outputInfo('For transactions done on babylonnet node ,you can visit https://babylonnet.tzstats.com for more information'))
    if(Object.keys(config.transactions).length > 0){        
        for(var i in config.transactions){
            console.log(tezsterManager.output(JSON.stringify(config.transactions[i])));        
        }
    } else{
        console.log(tezsterManager.outputError("No transactions are Available !!"));        
    }
}

module.exports = { listTransactions };