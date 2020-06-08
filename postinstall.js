const { confFile, CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE, TEZSTER_FOLDER_PATH_INSIDE_TEMP } = require('./modules/cli-constants');

const fs = require('fs'),
path = require('path');

const pathToFile = path.join(CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE);
const pathToNewDestination = confFile;

if(!fs.existsSync('/tmp/')) {
  fs.mkdirSync('/tmp/');
}

if(!fs.existsSync(TEZSTER_FOLDER_PATH_INSIDE_TEMP)) {
    fs.mkdirSync(TEZSTER_FOLDER_PATH_INSIDE_TEMP);
}

if(fs.existsSync(confFile)) {
    return;
}

fs.copyFileSync(pathToFile, pathToNewDestination, function(cpError) {
    if (cpError) {
        Helper.errorLogHandler(`Error occurred while copying the config file to temp folder: ${cpError}`,
                                'Error occurred while copying the config file....');
    } 
});