const { config, outputInfo } = require("../../tezster-manager");

function getProvider(){    
    if (config.provider){
        return outputInfo(config.provider);
    }else{
        return outputInfo("No provider is set");
    } 
}

module.exports = { getProvider };