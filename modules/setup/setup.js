const Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
const child_process = require('child_process');
const IMAGE_TAG = 'tezsureinc/tezster:1.0.1';
const CONTAINER_NAME = 'tezster';

const { Helper } = require('../../helper');

class Setup {

    setup() {
        console.log(Helper.outputInfo('We may need your password for write permission in config file....'));

        child_process.exec(`docker --version`, (error, __stdout, __stderr) => {
            if (__stdout.includes('Docker version')) {
                    this.checkPermission();
              } else {
                    console.log(Helper.outputError('Docker not detected on the system please install docker....'));
              }
        });
    }

    startNodes() {
        child_process.exec(`docker images ${IMAGE_TAG} --format '{{.Repository}}:{{.Tag}}:{{.Size}}'`,
        (error, __stdout, __stderr) => {
            if (__stdout === `${IMAGE_TAG}:3GB\n`) {

                child_process.exec(`docker ps -a -q  --filter ancestor=${IMAGE_TAG} --format '{{.Image}}:{{.Names}}'`,
                (error, __stdout, __stderr) => {
                    if (__stdout.includes(`${IMAGE_TAG}:${CONTAINER_NAME}\n`)) {
                          console.log(Helper.outputInfo('Nodes are already running....'));
                    } else {
                          this.runContainer();
                    }
                });
            } else {
                  console.log(Helper.outputError(`No inbuilt nodes found on system. Run 'tezster setup' comamnd for build the nodes.`));
              }
        });
    }

    stopNodes() {
        child_process.exec(`docker ps -a -q --format '{{.Image}}'`,(error, __stdout, __stderr) => {
            if (__stdout.includes(`${IMAGE_TAG}\n`)) {
                console.log(`stopping the nodes....`);
                const container = docker.getContainer(CONTAINER_NAME);
                docker.listContainers(function(err, containers) {
                    container.stop(); 
                    container.remove({force: true});
                    console.log(Helper.outputInfo(`Nodes have been stopped. Run 'tezster start-nodes' to restart.`));
                });
            } else {
               console.log(Helper.outputError('No Nodes are running....'));  
            } 
        });
    }

    getLogFiles() {
        console.log(Helper.outputInfo(`getting log file....please wait for some time`));
        const container = docker.getContainer(CONTAINER_NAME);

        const fs = require('fs');
        container.getArchive( { path: `/usr/local/bin/` }, (error, stream) => {
            let writeStream = fs.createWriteStream('/tmp/tezster-logs.tar.gz', { encoding: 'utf8' });

            if (error) {
                console.error('get archive error', error);
                writeStream.end();
                writeStream.close();
            }

            stream.on('data', (data) => {
                writeStream.write(data);
            });
        
            stream.on('end', () => {
                writeStream.end();
                writeStream.close();
                console.log(Helper.output(`log files stored as archieve format at: \n     '/tmp/tezster-logs.tar.gz'`))
            });
        });
    }

    checkPermission(){
        child_process.exec(`stat -c '%a %n' ${__dirname}/config.json`,(error, __stdout, __stderr) => {
            if (!error) {
                if (__stdout !== `777 ${__dirname}/config.json`) {
                    child_process.exec(`sudo chmod -R 777 ${__dirname}/config.json`);
                }
            }
        });
        this.buildImage();
    }

    buildImage() {              
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
                console.log(Helper.outputError('Make sure you have added docker to the USER group'));
                process.exit();
            } else {
                console.log('setting up tezos node, this could take a while....');      
                progressInterval = setInterval(() => {
                    progressbar.start(100, progress);
                    progress = progress + 0.70;
                    clearInterval(progress);
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                        progressbar.update(100);
                        progressbar.stop();
                        return;
                    }
                    progressbar.update(progress);
                    }, 1000);
                    docker.modem.followProgress(dockerPullStream, (__dockerModemError, __dockerModemOutput) => {
                        clearInterval(progress);
                        progressbar.update(100);
                        console.log(Helper.output('\nTezos nodes have been setup successfully on system....'));
                        process.exit();
                    });
                }
            });                     
    }

    runContainer(){
        this.startProgressBar();
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
                    console.log(Helper.outputError('Check whether docker is installed or not'));
                }
            });
        });
    }

    startProgressBar() {
        const _cliProgress = require('cli-progress');
        console.log('starting the nodes.....');
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

            const myInterval = setInterval(() =>{
                const request = require('request');
                request('http://localhost:18731/chains/main/blocks/head/protocols', function (error, response, body) {
                    if(error){
                        console.log('\n'+Helper.outputError(`check log files by using command 'tezster get-logs'...`));
                        process.exit();
                    } else {
                        var data = JSON.parse(body);
                        if(data.protocol.startsWith('PsCARTHAG')){
                            progressbar.update(100);
                            progressbar.stop();
                            console.log(Helper.output('Nodes have been started successfully....'));
                            clearInterval(myInterval);
                            process.exit();
                        }
                    }
                });
            },1000);
        },7000);
    }

}

module.exports = { Setup };