const tezsterManager = require("../../tezster-manager");

async function callContract() {
    var args = process.argv.slice(3);
    if (args.length < 3) {
        console.log(tezsterManager.outputInfo("Incorrect usage of call command \nCorrect usage: - tezster call <contract-name> <argument-value> <account>"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    
    let result = await tezsterManager.invokeContract(args[0], args[1], args[2]);
    console.log(result);
    console.log(tezsterManager.outputInfo(`If you're using babylonnet node, use https://babylonnet.tzstats.com to check contract/transactions`));
}

module.exports = { callContract };