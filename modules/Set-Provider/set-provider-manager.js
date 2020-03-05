const {TezsterManager} = require('../../tezster-manager');

class AccountsManager extends TezsterManager{

  setProvider(args){    
    //console.log()
    this.config.provider = args[0];
    this.jsonfile.writeFile(this.confFile, this.config);
    eztz.node.setProvider(config.provider);
    return outputInfo("Provider updated to " + config.provider);
}
}

module.exports = { AccountsManager };