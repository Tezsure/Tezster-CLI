const tezsterManager = require("../../tezster-manager");

async function activateTestnetAccount() {  
    var args = process.argv.slice(3);
    if (args.length < 1) {
        console.log(tezsterManager.outputInfo("Incorrect usage of activate-testnet-account command \nCorrect usage: - tezster activate-testnet-account <account-label>"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    
    let result = await tezsterManager.activateAlphanetAccount(args[0]);
    console.log(result);
    console.log(tezsterManager.outputInfo(`If this account has already been activated, it may throw 'invalid_activation' error. You can visit https://babylonnet.tzstats.com for more information on this account`));
}

module.exports = { activateTestnetAccount };