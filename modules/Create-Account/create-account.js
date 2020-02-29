const tezsterManager = require("../../tezster-manager");

async function createAccount() {  
    var args = process.argv.slice(3);  
    if (args.length < 3) return console.log(tezsterManager.outputError("Incorrect usage - tezster create-account <Identity> <Account Label> <amount> <spendable=true[Optional]> <delegatable=true[Optional]> <delegate[Optional]> <fee=0[Optional]>"));
    await tezsterManager.loadTezsterConfig(); 
    tezsterManager.createAccount(args).then((result) => {
        console.log(result);
    });
}

module.exports = { createAccount };