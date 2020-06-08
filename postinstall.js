const { confFile, CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE, TEZSTER_FOLDER_PATH_INSIDE_TEMP, TEMP_FOLDER } = require('./modules/cli-constants');

const fs = require('fs'),
path = require('path');

const pathToFile = path.join(CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE);
const pathToNewDestination = confFile;

if(!fs.existsSync(TEMP_FOLDER)) {
  fs.mkdirSync(TEMP_FOLDER);
}

if(!fs.existsSync(TEZSTER_FOLDER_PATH_INSIDE_TEMP)) {
    fs.mkdirSync(TEZSTER_FOLDER_PATH_INSIDE_TEMP);
}

if(fs.existsSync(confFile)) {
    setProviderForWindows();
    return;
}

fs.copyFileSync(pathToFile, pathToNewDestination, function(cpError) {
    if (cpError) {
        Helper.errorLogHandler(`Error occurred while copying the config file to temp folder: ${cpError}`,
                                'Error occurred while copying the config file....');
    } 
});

setProviderForWindows();

function setProviderForWindows() {
    const { TezsterManager } = require('./tezster-manager');
    const tezstermanager = new TezsterManager();
    if(process.platform.includes('win')) {
        tezstermanager.accounts.setProvider(['http://localhost:18731']);
    }
}