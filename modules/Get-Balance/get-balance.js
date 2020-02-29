const tezsterManager = require("../../tezster-manager");
const getBalanceManager = require("./get-balance-manager");

async function __getBalance() {
    var args = process.argv.slice(3);
    if (args.length < 1) {
        console.log(tezsterManager.outputInfo("Incorrect usage of get-balance command \nCorrect usage: - tezster get-balance <account/contract>"));
        return;
    }
    await tezsterManager.loadTezsterConfig();
    getBalanceManager.getBalance(args[0]).then((result) => {
        console.log(result);
    });
}

module.exports = { __getBalance };