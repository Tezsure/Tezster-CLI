const { config, outputInfo, jsonfile } = require("../../tezster-manager");

function setProvider(args){    
    config.provider = args[0];
    jsonfile.writeFile(confFile, config);
    eztz.node.setProvider(config.provider);
    return outputInfo("Provider updated to " + config.provider);
}

module.exports = { setProvider };