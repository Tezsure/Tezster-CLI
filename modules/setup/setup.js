const Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock', hosts: 'tcp://0.0.0.0:2376' });
const child_process = require('child_process'),
      IMAGE_TAG = 'tezsureinc/tezster:1.0.2',
      CONTAINER_NAME = 'tezster',
      PROGRESS_REFRESH_INTERVAL = 1000,
      NODE_CONFIRMATION_TIMEOUT = 40000,
      LOCAL_NODE_URL = 'http://localhost:18731';

const Logger = require('../logger');
const { Helper } = require('../helper');
const { RpcRequest } = require('../rpc-util');

class Setup {

    setup() {
        Logger.verbose('Command : tezster setup');
        Logger.warn('We may need your password for write permission in config file....');

        child_process.exec(`docker --version`, (error, _stdout, _stderr) => {
            if (_stdout.includes('Docker version')) {
                    this.checkPermission();
                    this.pullNodeSetup();
              } else if (error) {
                    Helper.logsCollection(`Error while setting up docker image: ${error}`, 'Docker not detected on the system please install docker....');
              } else {
                    Helper.logsCollection(`Error while setting up docker image: ${_stderr}`, 'Docker not detected on the system please install docker....');
              }
        });
    }

    startNodes() {
        Logger.verbose('Command : tezster start-nodes');
        child_process.exec(`docker images ${IMAGE_TAG} --format {{.Repository}}:{{.Tag}}:{{.Size}}`,
        (error, _stdout, _stderr) => {
            if (_stdout === `${IMAGE_TAG}:2.96GB\n`) {

                child_process.exec(`docker ps -a -q  --filter ancestor=${IMAGE_TAG} --format {{.Image}}:{{.Names}}`,
                (error, _stdout, _stderr) => {

                    if (_stdout.includes(`${IMAGE_TAG}:${CONTAINER_NAME}\n`)) {
                        this.startExistingContainer();
                    } else if (error) {
                        Helper.logsCollection(`Error occured while starting the nodes ${error}`, `Error while starting the nodes, restart the nodes after running 'tezster stop-nodes'`);
                    } else {                         
                        this.runContainer();
                    }
                });

            } else if(error){
                Helper.logsCollection(`Error while starting the nodes: ${error}`, `No inbuilt nodes found on system. Run 'tezster setup' comamnd for build the nodes.`);
            } else {
                Helper.logsCollection(`Error while starting the nodes: ${_stderr}`, `No inbuilt nodes found on system. Run 'tezster setup' comamnd for build the nodes.`);
            }
        });
    }

    stopNodes() {
        Logger.verbose('Command : tezster stop-nodes');
        child_process.exec(`docker ps -a -q --format {{.Image}}`,(error, _stdout, _stderr) => {
            if (_stdout.includes(`${IMAGE_TAG}\n`)) {
                Logger.warn(`stopping the nodes....`);
                const container = docker.getContainer(CONTAINER_NAME);
                container.stop(function (error, data){
                    if(error) {
                        Helper.logsCollection(`Error while stopping the nodes: ${error}`, 'Error occured while stopping the nodes');
                    }
                });
                container.remove({force: true});
                Logger.info(`Nodes have been stopped. Run 'tezster start-nodes' to restart.`);
            } else if (error) {
                Helper.logsCollection(`Error occured while stopping the nodes, error: ${error}`, 'Error occured while stopping the nodes');
            } else {
                Logger.error('No Nodes are running....');
            }
        });
    }

    getLogFiles() {
        Logger.verbose('Command : tezster get-logs');
        child_process.exec(`docker ps -q --format {{.Image}}`,(error, _stdout, _stderr) => {
            if (_stdout.includes(`${IMAGE_TAG}\n`)) {
                Logger.info(`getting log files....`);
                const container = docker.getContainer(CONTAINER_NAME);

                const fs = require('fs');
                container.getArchive( { path: `/usr/local/bin/tezster-logs` }, (error, stream) => {
                    let writeStream = fs.createWriteStream('/tmp/tezster-logs/tezster-node-logs.tar.gz', { encoding: 'utf8' });

                    if (error) {
                        Helper.logsCollection(`Error occured while fetching log archive: ${error}`, 'Error while fetching the logs archive on system');
                        writeStream.end();
                        writeStream.close();
                    }

                    stream.on('data', (data) => {
                        writeStream.write(data);
                    });
                
                    stream.on('end', () => {
                        writeStream.end();
                        writeStream.close();
                        Logger.info(`Log files has been stored at following folder location as archieve format: \n'/tmp/tezster-logs/tezster-node-logs.tar.gz'`);
                        Logger.warn(`To unzip file, run 'tar -xf tezster-node-logs.tar.gz' inside the file location folder.`);
                    });
                });
            } else { 
                Helper.logsCollection(`Error while fetching log files on system: ${error}`, `No container is in running state.... to get logs run 'tezster start-nodes' first.`);
                Logger.warn(`Run 'tezster start-nodes' to start nodes `);
            }
        });
    }

    async nodeStatus() {
        Logger.verbose('Command : tezster node-status');

        try {
            let response = await RpcRequest.checkNodeStatus(LOCAL_NODE_URL);
            if(response.protocol.startsWith('PsCARTHAG')){
                Logger.info('Local nodes are in running state....');
            } else {
                Logger.error('Nodes are not running....');
            }
        } catch (error) {
            Helper.logsCollection(`Error occured while confirming node status: ${error}`, 'Nodes are not running....');
        }
    }

    checkPermission(){
        child_process.exec(`stat -c '%a %n' ${__dirname}/../../config.json`,(error, _stdout, _stderr) => {
            if (!error) {
                if (_stdout !== `777 ${__dirname}/../../config.json`) {
                    child_process.exec(`sudo chmod -R 777 ${__dirname}/../../config.json`);
                }
            } else if(error){
                Helper.logsCollection(`Error while changing config.json file permission: ${error}`, 'Error occured while setting up node due to permission issue');
            } 
            else {
                Helper.logsCollection(`Error while changing config.json file permission: ${_stderr}`, 'Error occured while setting up node due to permission issue');
            }
        });
    }

    pullNodeSetup () {              
        const _cliProgress = require('cli-progress');
        let progress = 1;
        let progressInterval;
        const progressbar = new _cliProgress.Bar({
            format: 'Progress [{bar}] {percentage}%'
        },
        _cliProgress.Presets.shades_classic
        );

        docker.pull(IMAGE_TAG, (dockerPullError, dockerPullStream) => {
            if (dockerPullError) {
                Helper.logsCollection(`Error while pulling the docker image: ${dockerPullError}`, 'Make sure you have added docker to the USER group');
                process.exit();
            } else {
                Logger.info('setting up tezos node, this could take a while....');      
                progressInterval = setInterval(() => {
                    progressbar.start(100, progress);
                    progress = progress + 0.45;
                    clearInterval(progress);
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                        progressbar.update(100);
                        progressbar.stop();
                        return;
                    }
                    progressbar.update(progress);
                    }, PROGRESS_REFRESH_INTERVAL);
                    
                    docker.modem.followProgress(dockerPullStream, (_dockerModemError, _dockerModemOutput) => {
                        if(_dockerModemError) {
                            Helper.logsCollection(`Error occured while pulling docker image: ${_dockerModemError}`, 'Error occured while pulling the docker image');
                        } else {
                            clearInterval(progress);
                            progressbar.update(100);
                            Logger.info('\nTezos nodes have been setup successfully on system....');
                            process.exit();
                        }
                    });
                }
        });                     
    }

    startExistingContainer() {
        const container = docker.getContainer(CONTAINER_NAME);
        container.start(async (error, data) => {
            if(error) {
                Logger.verbose(`Error occured while starting the nodes: ${error}`);

                try {
                    let response = await RpcRequest.checkNodeStatus(LOCAL_NODE_URL);
                    if(response.protocol.startsWith('PsCARTHAG')){
                        Logger.info('Nodes are in running state....');
                    } else {
                        Logger.error (`Error occured in previously started nodes, restart nodes after running 'tezster stop-nodes'.`);
                    }
                } catch (error) {
                    Helper.logsCollection(`Error occured while starting the nodes${error}`, `Error occured in previously started nodes, restart nodes after running 'tezster stop-nodes'.`);
                }

                Logger.warn(`If facing any issue, fetch logs on your system using 'tezster get-logs' or try restarting the nodes after running 'tezster stop-nodes'.`);

            } else {
                this.startNodesProgressBar();
            }
        });
    }

    runContainer(){
        this.startNodesProgressBar();
        docker.createContainer({
            name: `${CONTAINER_NAME}`,
            Image: `${IMAGE_TAG}`,
            Tty: true,
            ExposedPorts: {
                '18731/tchildprocess': {},
                '18732/tchildprocess': {},
                '18733/tchildprocess': {},
            },
            PortBindings: {
                '18731/tchildprocess': [{
                    HostPort: '18731'
                }],
                '18732/tchildprocess': [{
                    HostPort: '18732'
                }],
                '18733/tchildprocess': [{
                    HostPort: '18733'
                }]
            },
            NetworkMode: 'host',
            Cmd: [
                '/bin/bash',
                '-c',
                'cd /usr/local/bin && start_nodes.sh && tail -f /dev/null'
            ]
        },
        function(err, container) {
            if(err) {
                Helper.logsCollection(`Error while starting the container: ${err}`, 'Error while starting the nodes....');
            } else {
                container.start({}, function(err, data) {
                    if (err) {
                        Helper.logsCollection(`Error while starting nodes: ${err}`, 'Error while starting the nodes....');
                    }
                });
            }
        });
    }

    startNodesProgressBar() {
        const _cliProgress = require('cli-progress');
        Logger.warn('starting the nodes.....');
        let progress = 0;
        let progressInterval;
        const progressbar = new _cliProgress.Bar({
            format: 'Progress [{bar}] {percentage}%'
        },
            _cliProgress.Presets.shades_classic
        );

        progressInterval = setInterval(() => {
            progressbar.start(100, progress);
            progress = progress + 2.5;
            clearInterval(progress);
            if (progress >= 100) {
                clearInterval(progressInterval);
                progressbar.update(100);
                progressbar.stop();
                return;
            }
            progressbar.update(progress);
        }, PROGRESS_REFRESH_INTERVAL);
        this.confirmNodeStatus();
    }

    confirmNodeStatus(){   
        setTimeout(() => {
            const _cliProgress = require('cli-progress');
            const progressbar = new _cliProgress.Bar({
                format: 'Progress [{bar}] {percentage}%'
            },
                _cliProgress.Presets.shades_classic
            );

            const interval = setInterval(() => {
                RpcRequest.checkNodeStatus(LOCAL_NODE_URL).then(function(statusData) {
                    if(statusData.protocol.startsWith('PsCARTHAG')){
                        progressbar.update(100);
                        progressbar.stop();
                        Logger.info('Nodes have been started successfully....');
                        clearInterval(interval);
                        process.exit();
                    }
                }).catch(function(error){
                    Helper.logsCollection(`Error while confirming node status: ${error}`, `\nError occured while starting the local nodes, to check logs please run 'tezster get-logs'.`);
                    process.exit();
                });
            }, PROGRESS_REFRESH_INTERVAL);
        }, NODE_CONFIRMATION_TIMEOUT);
    }

}

module.exports = { Setup };