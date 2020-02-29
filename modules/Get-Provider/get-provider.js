const tezsterManager = require("../../tezster-manager");

async function getProvider() {
    await tezsterManager.loadTezsterConfig(); 
    console.log(tezsterManager.getProvider());
}

module.exports = { getProvider };