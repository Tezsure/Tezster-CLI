const tezsterManager = require("../../tezster-manager");

async function addContract() {
    var args = process.argv.slice(3);  
    if (args.length < 2) return console.log(tezsterManager.outputError("Incorrect usage - tezster add-contract <label> <Address>"));
    await tezsterManager.loadTezsterConfig();
    console.log(tezsterManager.addContract(args[0], args[1], ''));      
}

module.exports = { addContract };