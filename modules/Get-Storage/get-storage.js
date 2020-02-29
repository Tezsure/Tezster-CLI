const tezsterManager = require("../../tezster-manager");

async function getStorage() {
    var args = process.argv.slice(3);
    if (args.length < 1) {
        console.log(tezsterManager.outputInfo("Incorrect usage of get-storage command \nCorrect usage: - tezster get-storage <contract-name>"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    
    let result = await tezsterManager.getStorage(args[0]);
    console.log(result);
}

module.exports = { getStorage };