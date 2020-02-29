const tezsterManager = require("../../tezster-manager");
const getProviderManager = require("./get-provider-manager");

async function __getProvider() {
    await tezsterManager.loadTezsterConfig(); 
    console.log(getProviderManager.getProvider());
}

module.exports = { __getProvider };