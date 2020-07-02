const { confFile, CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE, TEZSTER_FOLDER_PATH, TEZSTER_LOGS_FOLDER_PATH, COMMAND_LOG_FILE, TEMP_PATH } = require('./modules/cli-constants');

const fs = require('fs'),
      path = require('path'),
      { Helper } = require('./modules/helper');

const pathToFile = path.join(CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE),
      pathToNewDestination = confFile;

if(!fs.existsSync(TEMP_PATH)) {
    fs.mkdirSync(TEMP_PATH, {recursive: true});
    fs.chmodSync(TEMP_PATH, 0777);
}

if(!fs.existsSync(TEZSTER_FOLDER_PATH)) {
    fs.mkdirSync(TEZSTER_FOLDER_PATH);
    fs.chmodSync(TEZSTER_FOLDER_PATH, 0777);
}

if(!fs.existsSync(TEZSTER_LOGS_FOLDER_PATH)) {
    fs.mkdirSync(TEZSTER_LOGS_FOLDER_PATH);
    fs.chmodSync(TEZSTER_LOGS_FOLDER_PATH, 0777);
}

if(!fs.existsSync(COMMAND_LOG_FILE)) {
    fs.writeFileSync(COMMAND_LOG_FILE);
    fs.chmodSync(COMMAND_LOG_FILE, 0777);
}

if(fs.existsSync(confFile)) {
    setProviderForWindows();
    return;
}

fs.copyFileSync(pathToFile, pathToNewDestination, function(cpError) {
    if (cpError) {
        Helper.errorLogHandler(`Error occurred while copying the config file to documents folder: ${cpError}`,
                                'Error occurred while copying the config file....');
    } 
});
fs.chmodSync(pathToNewDestination, 0777);

setProviderForWindows();

function setProviderForWindows() {
    if(Helper.isWindows()) {
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