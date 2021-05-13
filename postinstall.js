try {
    const { confFile, CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE } = require('./modules/cli-constants');
    const fs = require('fs'),
          path = require('path'),
          { Helper } = require('./modules/helper');
    const COPY_FILE_MODE = fs.constants.COPYFILE_FICLONE;

    const pathToFile = path.join(CONFIG_FILE_ABSOLUTE_PATH_INSIDE_NPM_PACKAGE),
          pathToNewDestination = confFile;

    let { version } = require('./package.json');
    version.substring(0, version.indexOf('-'));

    const setProviderForWindows = function () {
        if (Helper.isWindows()) {
            const { confFile } = require('./modules/cli-constants'),
                jsonfile = require('jsonfile'),
                config = jsonfile.readFileSync(confFile),
                Logger = require('./modules/logger'),
                docker_machine_ip = require('docker-ip');
            let current_docker_machine_ip;
            try {
                current_docker_machine_ip = docker_machine_ip();
            } catch (error) {
                Logger.error(
                    `Error occurred while fetching docker machine ip address during postinstall: ${error}`
                );
            }
            if (current_docker_machine_ip.includes('localhost')) {
                current_docker_machine_ip = '192.168.99.100';
            } else if (current_docker_machine_ip.includes('192')) {
                current_docker_machine_ip = current_docker_machine_ip;
            } else {
                current_docker_machine_ip = 'localhost';
            }
            config.provider = `http://${current_docker_machine_ip}:18732`;
            jsonfile.writeFile(confFile, config);
        }
    };

    if (fs.existsSync(confFile) && version >= ('0.3.2')) {
        setProviderForWindows();
        return;
    } 

    fs.copyFileSync(pathToFile, pathToNewDestination, COPY_FILE_MODE);
    fs.chmodSync(pathToNewDestination, 0777);
    setProviderForWindows();

} catch (error) {
    console.error(error);
    return error;
}