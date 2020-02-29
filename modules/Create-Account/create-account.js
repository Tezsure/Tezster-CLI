const tezsterManager = require("../../tezster-manager");
const createAccountManager = require("./create-account-manager");

async function __createAccount() {  
    var args = process.argv.slice(3);  
    if (args.length < 3) return console.log(tezsterManager.outputError("Incorrect usage - tezster create-account <Identity> <Account Label> <amount> <spendable=true[Optional]> <delegatable=true[Optional]> <delegate[Optional]> <fee=0[Optional]>"));
    await tezsterManager.loadTezsterConfig(); 
    createAccountManager.createAccount(args).then((result) => {
        console.log(result);
    });
}

module.exports = { __createAccount };