const tezsterManager = require("../../tezster-manager");

async function __setProvider() {
    var args = process.argv.slice(3);  
    if (args.length < 1){ 
        console.log(tezsterManager.outputError("Incorrect usage - tezster set-provider http://{ip}:{port}"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    console.log(tezsterManager.setProvider(args));
}

module.exports = { __setProvider };