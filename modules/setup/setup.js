const Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock', hosts: 'tcp://0.0.0.0:2376' });
const child_process = require('child_process'),
      IMAGE_TAG = 'tezsureinc/tezster:1.0.2',
      CONTAINER_NAME = 'tezster',
      PROGRESS_REFRESH_INTERVAL = 1000,
      NODE_CONFIRMATION_TIMEOUT = 10000,
      LOCAL_NODE_URL = 'http://localhost:18731';

const Logger = require('../logger');
const { RpcRequest } = require('../rpc-util');

class Setup {

    setup() {
        Logger.verbose('Command : tezster setup');
        Logger.warn('We may need your password for write permission in config file....');

        child_process.exec(`docker --version`, (error, _stdout, _stderr) => {
            if (_stdout.includes('Docker version')) {
                    this.checkPermission();
                    this.pullNodeSetup();
              } else {
                    Logger.verbose(`Error while tezster setup error: ${error}`);
                    Logger.verbose(`Error while tezster setup _stderror: ${_stderr}`);
                    Logger.error('Docker not detected on the system please install docker....');
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
                    let self = this;
                    if (_stdout.includes(`${IMAGE_TAG}:${CONTAINER_NAME}\n`)) {
                        const container = docker.getContainer(CONTAINER_NAME);
                        container.start(function (error, data){
                            if(error) {
                                Logger.verbose(`Error while starting nodes: ${error}`);
                                Logger.info('Nodes are already running....');
                                Logger.warn(`If still facing issue run, 'tezster get-logs' or try restarting the nodes after running 'tezster stop-nodes'....`);
                            } else {
                                self.startNodesProgressBar();
                            }
                        });
                    } else if (error) {
                        Logger.verbose(`Error while starting nodes error: ${error}`);
                    } else {                         
                          this.runContainer();
                    }
                });
            } else {
                  Logger.verbose(`Error while starting nodes error: ${error}`);
                  Logger.verbose(`Error while starting nodes std_err: ${_stderr}`);   
                  Logger.error(`No inbuilt nodes found on system. Run 'tezster setup' comamnd for build the nodes.`);
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
                        Logger.verbose(`Error while stopping the nodes: ${error}`);
                    }
                });
                container.remove({force: true});
                Logger.info(`Nodes have been stopped. Run 'tezster start-nodes' to restart.`);
            } else {
               Logger.verbose(`Error while stopping nodes error: ${error}`);
               Logger.verbose(`Error while stopping nodes std_err: ${_stderr}`);   
               Logger.error('No Nodes are running....');
            } 
        });
    }

    getLogFiles() {
        Logger.verbose('Command : tezster get-logs');
        child_process.exec(`docker ps -q --format {{.Image}}`,(error, _stdout, _stderr) => {
            if (_stdout.includes(`${IMAGE_TAG}\n`)) {
                Logger.warn(`getting log file....please wait for some time`);
                const container = docker.getContainer(CONTAINER_NAME);

                const fs = require('fs');
                container.getArchive( { path: `/usr/local/bin/tezster-logs` }, (error, stream) => {
                    let writeStream = fs.createWriteStream('/tmp/tezster-logs/tezster-node-logs.tar.gz', { encoding: 'utf8' });

                    if (error) {
                        Logger.verbose(`Error while fetching log files: ${error}`);
                        Logger.error(`get archive error ${error}`);
                        writeStream.end();
                        writeStream.close();
                    }

                    stream.on('data', (data) => {
                        writeStream.write(data);
                    });
                
                    stream.on('end', () => {
                        writeStream.end();
                        writeStream.close();
                        Logger.info(`log files stored as archieve format at: \n'/tmp/tezster-logs/tezster-logs.tar.gz'`);
                    });
                });
            } else { 
                Logger.verbose(`Error while fetching log files error: ${error}`);
                Logger.verbose(`Error while fetching log files _stderr: ${_stderr}`);
                Logger.error(`No container is in running state....`);
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
            Logger.verbose(`Error while confirming node status: ${error}`);
            Logger.error('Nodes are not running....');
        }
    }

    checkPermission(){
        child_process.exec(`stat -c '%a %n' ${__dirname}/../../config.json`,(error, _stdout, _stderr) => {
            if (!error) {
                if (_stdout !== `777 ${__dirname}/../../config.json`) {
                    child_process.exec(`sudo chmod -R 777 ${__dirname}/../../config.json`);
                }
            } else {
                Logger.verbose(`Error in check permission while starting nodes _stderr: ${_stderr}`);
                Logger.verbose(`Error in check permission while pulling docker image: ${error}`);
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
                Logger.verbose(`Error while pull docker image: ${dockerPullError}`);
                Logger.error('Make sure you have added docker to the USER group');
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
                            Logger.verbose(`Error message while pull docker image: ${_dockerModemError}`);
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
                Logger.verbose(`Error while starting the container: ${err}`);
            } else {
                container.start({}, function(err, data) {
                    if (err) {
                        Logger.verbose(`Error while start-nodes: ${err}`);
                        Logger.error('Check whether docker is installed or not');
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
            progress = progress + 3.6;
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
                    Logger.verbose(`Error in confirm node status while starting nodes: ${error}`);
                    Logger.error('\n'+`Error while starting nodes: check logs by using command 'tezster get-logs'...`);
                    process.exit();
                });
            }, PROGRESS_REFRESH_INTERVAL);
        }, NODE_CONFIRMATION_TIMEOUT);
    }

}

module.exports = { Setup };