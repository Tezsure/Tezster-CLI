const { confFile, WIN_PROCESS_PLATFORM, CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE, TEZSTER_FOLDER_PATH_INSIDE_TEMP, TEMP_FOLDER , TEZSTER_LOGS_FOLDER_PATH_INSIDE_TEMP, COMMAND_LOG_FILE } = require('./modules/cli-constants');

const fs = require('fs'),
path = require('path');

const pathToFile = path.join(CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE);
const pathToNewDestination = confFile;

if(!fs.existsSync(TEMP_FOLDER)) {
  fs.mkdirSync(TEMP_FOLDER);
  fs.chmodSync(TEMP_FOLDER, 0777);
}

if(!fs.existsSync(TEZSTER_FOLDER_PATH_INSIDE_TEMP)) {
    fs.mkdirSync(TEZSTER_FOLDER_PATH_INSIDE_TEMP);
    fs.chmodSync(TEZSTER_FOLDER_PATH_INSIDE_TEMP, 0777);
}

if(!fs.existsSync(TEZSTER_LOGS_FOLDER_PATH_INSIDE_TEMP)) {
    fs.mkdirSync(TEZSTER_LOGS_FOLDER_PATH_INSIDE_TEMP);
    fs.chmodSync(TEZSTER_LOGS_FOLDER_PATH_INSIDE_TEMP, 0777);
}

if(!fs.existsSync(COMMAND_LOG_FILE)) {
    fs.createWriteStream(COMMAND_LOG_FILE);
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
fs.chmodSync(COMMAND_LOG_FILE, 0777);
fs.chmodSync(pathToNewDestination, 0777);

setProviderForWindows();

function setProviderForWindows() {
    if(process.platform.includes(WIN_PROCESS_PLATFORM)) {
        const { confFile } = require('./modules/cli-constants'),
            jsonfile = require('jsonfile'),
            config = jsonfile.readFileSync(confFile),
            Logger = require('./modules/logger'),
            docker_machine_ip = require('docker-ip');
        let current_docker_machine_ip;

        try {
            current_docker_machine_ip = docker_machine_ip();
        } catch(error) {
            Logger.error(`Error occurred while fetching docker machine ip address during postinstall: ${error}`);
        }

        if(current_docker_machine_ip.includes('localhost')) {
            current_docker_machine_ip = '192.168.99.100';
        } else if(current_docker_machine_ip.includes('192')) {
            current_docker_machine_ip = current_docker_machine_ip;
        } else {
            current_docker_machine_ip = 'localhost';
        }
        
        config.provider = `http://${current_docker_machine_ip}:18731`;
        jsonfile.writeFile(confFile, config);
    }

}