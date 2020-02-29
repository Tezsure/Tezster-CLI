const tezsterManager = require("../../tezster-manager");

async function addTestnetAccount() {  
    var args = process.argv.slice(3);
    if (args.length < 2) {
        console.log(tezsterManager.outputInfo("Incorrect usage of add-testnet-account command \nCorrect usage: - tezster add-testnet-account <account-label> <absolut-path-to-json-file>"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    
    let result = tezsterManager.restoreAlphanetAccount(args[0], args[1]);
    console.log(result);
}

module.exports = { addTestnetAccount };