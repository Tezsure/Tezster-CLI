const tezsterManager = require("../../tezster-manager");

async function deployContract() {
var args = process.argv.slice(3);
    if (args.length < 4) {
        console.log(tezsterManager.outputInfo("Incorrect usage of deploy command \nCorrect usage: - tezster deploy <contract-label> <contract-absolute-path> <init-storage-value> <account>"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 

    let result = await tezsterManager.deployContract(args[0], args[1], args[2], args[3]);
    console.log(result);
    console.log(tezsterManager.outputInfo(`If you're using babylonnet node, use https://babylonnet.tzstats.com to check contract/transactions`));
}

module.exports = { deployContract };