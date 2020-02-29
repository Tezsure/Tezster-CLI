const tezsterManager = require("../../tezster-manager");
const transferManager = require("./transfer-manager");

async function __transfer() {
    var args = process.argv.slice(3);  
    if (args.length < 2) {
        console.log(tezsterManager.outputError("Incorrect usage - tezster transfer <amount> <from> <to>"));
        return;
    }
    await tezsterManager.loadTezsterConfig();
    transferManager.transferAmount(args).then((result) => {        
        console.log(result);
    });
}

module.exports = { __transfer };