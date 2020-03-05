const confFile = __dirname + '/../../config.json';
const jsonfile = require('jsonfile');
var eztz = {};
var config = jsonfile.readFileSync(confFile);
const ConseilJS = '../../lib/conseiljs';
const cliColors = {
    red : '31m',
    yellow : '33m',
    cyan : '36m',
    white : '37m',
    green : '32m',
  };

class accounts{

async __setProvider(){
    var args = process.argv.slice(3);  
    if (args.length < 1){ 
        console.log(outputError("Incorrect usage - tezster set-provider http://{ip}:{port}"));
        return;
    }
    await this.loadTezsterConfig(); 
    console.log(this.setProvider(args));
}

setProvider(args){    
    config.provider = args[0];
    jsonfile.writeFile(confFile, config);
    eztz.node.setProvider(config.provider);
    return this.outputInfo("Provider updated to " + config.provider);
}

async loadTezsterConfig() {
    eztz = require('../../lib/eztz.cli.js').eztz;
    const jsonfile = require('jsonfile');
    config=jsonfile.readFileSync(confFile);
    if (config.provider) {
        eztz.node.setProvider(config.provider);
    }  
    const _sodium = require('libsodium-wrappers');
    await _sodium.ready;
    eztz.library.sodium = _sodium;
}

outputError(e){
    return '\x1b['+cliColors.red+'Error: '+e.toString().replace('Error:','')+'\x1b[0m';
}

outputInfo(e){
    return '\x1b['+cliColors.yellow+e+'\x1b[0m';
}

output(e){
    return '\x1b['+cliColors.green+e+'\x1b[0m';
}

}

module.exports = { accounts }

