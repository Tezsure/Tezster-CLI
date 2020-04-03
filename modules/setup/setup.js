const Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
const child_process = require('child_process'),
      IMAGE_TAG = 'tezsureinc/tezster:1.0.2',
      CONTAINER_NAME = 'tezster';

const Logger = require('../logger');
const { Helper } = require('../helper');

class Setup {

    setup() {
        Logger.verbose('Command : tezster setup');
        Logger.info(Helper.outputInfo('We may need your password for write permission in config file....'));

        child_process.exec(`docker --version`, (error, _stdout, _stderr) => {
            if (_stdout.includes('Docker version')) {
                    this.checkPermission();
              } else {
                    Logger.info(Helper.outputError('Docker not detected on the system please install docker....'));
              }
        });
    }

    startNodes() {
        Logger.verbose('Command : tezster start-nodes');
        child_process.exec(`docker images ${IMAGE_TAG} --format '{{.Repository}}:{{.Tag}}:{{.Size}}'`,
        (error, _stdout, _stderr) => {
            if (_stdout === `${IMAGE_TAG}:2.96GB\n`) {

                child_process.exec(`docker ps -a -q  --filter ancestor=${IMAGE_TAG} --format '{{.Image}}:{{.Names}}'`,
                (error, _stdout, _stderr) => {
                    if (_stdout.includes(`${IMAGE_TAG}:${CONTAINER_NAME}\n`)) {
                          Logger.info(Helper.outputInfo('Nodes are already running....'));
                    } else {
                          this.runContainer();
                    }
                });
            } else {
                  Logger.info(Helper.outputError(`No inbuilt nodes found on system. Run 'tezster setup' comamnd for build the nodes.`));
              }
        });
    }

    stopNodes() {
        Logger.verbose('Command : tezster stop-nodes');
        child_process.exec(`docker ps -a -q --format '{{.Image}}'`,(error, _stdout, _stderr) => {
            if (_stdout.includes(`${IMAGE_TAG}\n`)) {
                Logger.info(`stopping the nodes....`);
                const container = docker.getContainer(CONTAINER_NAME);
                docker.listContainers(function(err, containers) {
                    container.stop(); 
                    container.remove({force: true});
                    Logger.info(Helper.outputInfo(`Nodes have been stopped. Run 'tezster start-nodes' to restart.`));
                });
            } else {
               Logger.info(Helper.outputError('No Nodes are running....'));  
            } 
        });
    }

    getLogFiles() {
        Logger.verbose('Command : tezster get-logs');
        child_process.exec(`docker ps -q --format '{{.Image}}'`,(error, _stdout, _stderr) => {
            if (_stdout.includes(`${IMAGE_TAG}\n`)) {
                Logger.info(Helper.outputInfo(`getting log file....please wait for some time`));
                const container = docker.getContainer(CONTAINER_NAME);

                const fs = require('fs');
                container.getArchive( { path: `/usr/local/bin/tezster-logs` }, (error, stream) => {
                    let writeStream = fs.createWriteStream('/tmp/tezster-logs/tezster-node-logs.tar.gz', { encoding: 'utf8' });

                    if (error) {
                        Logger.info(Helper.outputError('get archive error', error));
                        writeStream.end();
                        writeStream.close();
                    }

                    stream.on('data', (data) => {
                        writeStream.write(data);
                    });
                
                    stream.on('end', () => {
                        writeStream.end();
                        writeStream.close();
                        Logger.info(Helper.output(`log files stored as archieve format at: \n'/tmp/tezster-logstezster-logs.tar.gz'`))
                    });
                });
            } else { 
                Logger.info(Helper.outputError(`No container is in running state....`));
                Logger.info(Helper.outputInfo(`Run 'tezster start-nodes' to start nodes `));
            }
        });
    }

    checkPermission(){
        child_process.exec(`stat -c '%a %n' ${__dirname}/config.json`,(error, _stdout, _stderr) => {
            if (!error) {
                if (_stdout !== `777 ${__dirname}/config.json`) {
                    child_process.exec(`sudo chmod -R 777 ${__dirname}/config.json`);
                }
            }
        });
        this.pullNodeSetup();
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
                Logger.info(Helper.outputError('Make sure you have added docker to the USER group'));
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
                    }, 1000);
                    docker.modem.followProgress(dockerPullStream, (_dockerModemError, _dockerModemOutput) => {
                        clearInterval(progress);
                        progressbar.update(100);
                        Logger.info(Helper.output('\nTezos nodes have been setup successfully on system....'));
                        process.exit();
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
                '18731/tchildprocess:': {}
            },
            PortBindings: {
                '18731/tchildprocess': [{
                HostPort: '18731'
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
            container.start({}, function(err, data) {
                if (err) {
                    Logger.info(Helper.outputError('Check whether docker is installed or not'));
                }
            });
        });
    }

    startNodesProgressBar() {
        const _cliProgress = require('cli-progress');
        Logger.info('starting the nodes.....');
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
        }, 1000);
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

            const interval = setInterval(() =>{
                const request = require('request');
                request('http://localhost:18731/chains/main/blocks/head/protocols', function (error, response, body) {
                    if(error){
                        Logger.info('\n'+Helper.outputError(`check log files by using command 'tezster get-logs'...`));
                        process.exit();
                    } else {
                        var data = JSON.parse(body);
                        if(data.protocol.startsWith('PsCARTHAG')){
                            progressbar.update(100);
                            progressbar.stop();
                            Logger.info(Helper.output('Nodes have been started successfully....'));
                            clearInterval(interval);
                            process.exit();
                        }
                    }
                });
            },1000);
        },10000);
    }

}

module.exports = { Setup };