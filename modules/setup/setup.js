const Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock', hosts: 'tcp://0.0.0.0:2376' });

const { confFile, IMAGE_TAG, CONTAINER_NAME, LOCAL_NODE_URL, PROGRESS_REFRESH_INTERVAL, LOG_FOLDER_PATH_INSIDE_DOCKER, LOGS_ZIPFILE_PATH, LOGS_ZIPFILE_NAME, START_NODES_PROGRESS_BAR_INTERVAL_WIN, NODE_CONFIRMATION_TIMEOUT_WIN } = require('../cli-constants');
let { Node_Confirmation_Timeout, Start_Nodes_Progress_Bar_Interval } = require('../cli-constants');
const jsonfile = require('jsonfile'),
      Logger = require('../logger'),
      { Helper } = require('../helper'),
      { RpcRequest } = require('../rpc-util');

let config;

class Setup {

    constructor() {
        config = jsonfile.readFileSync(confFile);
    }

    setup() {
        Logger.verbose('Command : tezster setup');
        docker.version().then((result) => {
            this.pullNodeSetup();
        })
        .catch(error => Helper.errorLogHandler(`Error occurred while setting up docker image: ${error}`,
                                               'Docker not detected on the system please install docker or start if already installed....'));

    }

    startNodes() {
        Logger.verbose('Command : tezster start-nodes');
        docker.getImage(IMAGE_TAG).inspect().then((result) => {

            docker.getContainer(CONTAINER_NAME).inspect().then(async(result) => {
                if(result.State.Status === 'exited' || result.State.Status === 'running') {
                    if(result.Config.Image !== IMAGE_TAG) {
                        await this.stopAndRemoveContainer();
                        this.runContainer();
                        return;
                    } else {
                        this.startExistingContainer();
                    }
                } else {
                    Helper.errorLogHandler(`Error occurred while starting the nodes: ${error}`,
                                           `Error occurred while starting the nodes....`);
                }
            })
            .catch(error => {
                this.runContainer();
                Logger.verbose(`Error occurred while starting the nodes: ${error}`);
            });
        })
        .catch(error => Helper.errorLogHandler(`Error occurred while starting the nodes: ${error}`,
                                               `No inbuilt nodes found on system. Run 'tezster setup' command for build the nodes.`));
    }

    stopNodes() {
        Logger.verbose('Command : tezster stop-nodes');

        docker.getContainer(CONTAINER_NAME).inspect().then((result) => {
            if(result.State.Status === 'exited' || result.State.Status === 'running') {
                Logger.warn(`stopping the nodes....`);
                this.stopAndRemoveContainer();
                Logger.info(`Nodes have been stopped. Run 'tezster start-nodes' to restart.`);
            } else {
                Logger.error('No Nodes are running....');
            }
        })
        .catch(error => Helper.errorLogHandler(`Error occurred while stopping the nodes: ${error}`,
                                                'No Nodes are running....'));
    }

    getLogFiles() {
        Logger.verbose('Command : tezster get-logs');
        
        docker.getContainer(CONTAINER_NAME).inspect().then((result) => {
            if(result.State.Status === 'exited' || result.State.Status === 'running') {
                Logger.info(`getting log files....`);
                const container = docker.getContainer(CONTAINER_NAME);

                const fs = require('fs');
                container.getArchive( { path: LOG_FOLDER_PATH_INSIDE_DOCKER }, (error, stream) => {
                    let writeStream = fs.createWriteStream(LOGS_ZIPFILE_PATH, { encoding: 'utf8' });

                    if (error) {
                        Helper.errorLogHandler(`Error occurred while fetching log archive: ${error}`,
                                               'Error occurred while fetching the logs archive on system');
                        writeStream.end();
                        writeStream.close();
                    }

                    stream.on('data', (data) => {
                        writeStream.write(data);
                    });
                
                    stream.on('end', () => {
                        writeStream.end();
                        writeStream.close();
                        Logger.info(`Log files has been stored at following folder location as archive format: \n'${LOGS_ZIPFILE_PATH}'`);
                        Logger.warn(`To unzip file, run 'tar -xf ${LOGS_ZIPFILE_NAME}'.`);
                    });
                });
            }
        })
        .catch(error => Helper.errorLogHandler(`Error occurred while fetching log files on system: ${error}`,
                                               `No container is in running state.... Run 'tezster start-nodes' to start the container.`));
    }

    async nodeStatus() {
        Logger.verbose('Command : tezster node-status');

        if(config.provider.includes('localhost') || config.provider.includes('192.168')) {
            try {
                let response = await RpcRequest.checkNodeStatusForLocalNodes(LOCAL_NODE_URL);
                if(response.protocol.startsWith('PsCARTHAG')){
                    Logger.info('Local nodes are in running state....');
                    Logger.warn(`Name: Tezos`);
                    Logger.warn(`Network: Local`);
                    Logger.warn(`Protocol: ${response.protocol}`);
                    Logger.warn(`Chain ID: ${response.chain_id}`);
                    Logger.warn(`Block Hash: ${response.hash}`);
                    Logger.warn(`Baker: ${response.metadata.baker}`);
                    Logger.warn(`Cycle: ${response.metadata.level.cycle}`);
                    Logger.warn(`Latest Block: ${response.header.level}`);
                } else {
                    Logger.error('Local nodes are not running....');
                }
            } catch (error) {
                Helper.errorLogHandler(`Error occurred while confirming node status: ${error}`,
                                        'Local nodes are not running....');
            }
        } else {
            try {
                let response = await RpcRequest.fetchBlockDetailsForRemoteNodes(config.provider);
                Logger.warn(`Name: ${response[1].name}`);
                Logger.warn(`Network: ${response[1].network}`);
                Logger.warn(`Protocol: ${response[1].protocol}`);
                Logger.warn(`Chain ID: ${response[1].chain_id}`);
                Logger.warn(`Block Hash: ${response[0].hash}`);
                Logger.warn(`Baker: ${response[0].baker}`);
                Logger.warn(`Cycle: ${response[0].cycle}`);
                Logger.warn(`Latest Block: ${response[0].height}`);
                Logger.warn(`Blocks Per Cycle: ${response[1].blocks_per_cycle}`);
                Logger.warn(`Endorsement Reward: ${response[1].endorsement_reward}`);
            } catch (error) {
                Helper.errorLogHandler(`Error occurred while confirming node status: ${error}`,
                                        'Error occurred while fetching block details....');
            }
        }
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
                Helper.errorLogHandler(`Error occurred while pulling the docker image: ${dockerPullError}`,
                                       'Make sure you have added docker to the USER group');
                process.exit();
            } else {
                Logger.info('Setting up tezos node, this could take a while....');      
                progressInterval = setInterval(() => {
                    progressbar.start(100, progress);
                    progress = progress + 0.45;
                    clearInterval(progress);
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                        progressbar.update(100);
                        progressbar.stop();
                        Logger.warn('Network might be slow, wait a bit....');
                        return;
                    }
                    progressbar.update(progress);
                    }, PROGRESS_REFRESH_INTERVAL);
                    
                    docker.modem.followProgress(dockerPullStream, (_dockerModemError, _dockerModemOutput) => {
                        if(_dockerModemError) {
                            Helper.errorLogHandler(`Error occurred while pulling docker image: ${_dockerModemError}`,
                                                   'Error occurred while pulling the docker image');
                        } else {
                            clearInterval(progress);
                            progressbar.update(100);
                            Logger.info('\nTezos nodes have been setup successfully on system.');
                            process.exit();
                        }
                    });
                }
        });                     
    }

    async stopAndRemoveContainer() {
        const container = docker.getContainer(CONTAINER_NAME);
        container.stop(function (error, data){
            if(error) {
                Logger.verbose(`Error occurred while stopping the nodes: ${error}`);
            }
        });
        await container.remove({force: true});
    }

    startExistingContainer() {
        const container = docker.getContainer(CONTAINER_NAME);
        container.start(async (error, data) => {
            if(error) {
                Logger.verbose(`Error occurred while starting the nodes: ${error}`);

                try {
                    let response = await RpcRequest.checkNodeStatusForLocalNodes(LOCAL_NODE_URL);
                    if(response.protocol.startsWith('PsCARTHAG')){
                        Logger.info('Nodes are in running state....');
                    } else {
                        Logger.error (`Error occurred in previously started nodes, try restarting the nodes after running 'tezster stop-nodes'.`);
                    }
                } catch (error) {
                    Helper.errorLogHandler(`Error occurred while starting the nodes${error}`,
                                           `Error occurred in previously started nodes, try restarting the nodes after running 'tezster stop-nodes'.`);
                }

                Logger.warn(`If facing any issue, fetch logs on your system using 'tezster get-logs' or try restarting the nodes after running 'tezster stop-nodes'.`);

            } else {
                this.startNodesProgressBar();
            }
        });
    }

    runContainer(){
        this.startNodesProgressBar();
        docker.run ( 
            `${IMAGE_TAG}`, 
            [
                '/bin/bash', 
                '-c', 
                ` cd /usr/local/bin && start_nodes.sh && tail -f /dev/null`
            ], 
            [process.stdout],
            {
                name: `${CONTAINER_NAME}`,
                ExposedPorts: {
                    '18731/tcp': {}
                },
                Hostconfig: {
                    'PortBindings': {
                        '18731/tcp': [{
                            'HostPort': '18732'
                        }]
                    }
                },
            },
            function(err) {
                if (err) {
                    Helper.errorLogHandler(`Error occurred while starting nodes: ${err}`,
                                           'Error occurred while starting the nodes....');
                }
            })

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
        if(Helper.isWindows() || Helper.isWSL()) {
            Start_Nodes_Progress_Bar_Interval = START_NODES_PROGRESS_BAR_INTERVAL_WIN;
        }

        progressInterval = setInterval(() => {
            progressbar.start(100, progress);
            progress = progress + Start_Nodes_Progress_Bar_Interval;
            clearInterval(progress);
            if (progress >= 100) {
                clearInterval(progressInterval);
                progressbar.update(100);
                progressbar.stop();
                Helper.clearContractAndAccountForLocalNode();
                return;
            }
            progressbar.update(progress);
        }, PROGRESS_REFRESH_INTERVAL);
        this.confirmNodeStatus();
    }

    confirmNodeStatus(){   
        if(Helper.isWindows() || Helper.isWSL()) {
            Node_Confirmation_Timeout = NODE_CONFIRMATION_TIMEOUT_WIN;
        }
        setTimeout(() => {
            const _cliProgress = require('cli-progress');
            const progressbar = new _cliProgress.Bar({
                format: 'Progress [{bar}] {percentage}%'
            },
                _cliProgress.Presets.shades_classic
            );

            const interval = setInterval(() => {
                RpcRequest.checkNodeStatusForLocalNodes(LOCAL_NODE_URL).then(function(statusData) {
                    if(statusData.protocol.startsWith('PsCARTHAG')){
                        progressbar.update(100);
                        progressbar.stop();
                        Logger.info('Nodes have been started successfully....');
                        clearInterval(interval);
                        process.exit();
                    }
                }).catch(function(error){
                    Helper.errorLogHandler(`Error occurred while confirming node status: ${error}`,
                                           `\nError occurred while starting the local nodes, to check logs please run 'tezster get-logs'.`);
                    process.exit();
                });
            }, PROGRESS_REFRESH_INTERVAL);
        }, Node_Confirmation_Timeout);
    }

}

module.exports = { Setup };