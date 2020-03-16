const Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
const child_process = require('child_process');
const IMAGE_TAG = 'tezsureinc/tezster:1.0.0';
const CONTAINER_NAME = 'tezster';

const { Helper } = require('../../helper');

class Setup{

  setup() {
      console.log(Helper.outputInfo(
        "We may need your password for write permission in config file...."
      ));

      childprocess.exec(`docker --version`, (error, __stdout, __stderr) => {
        if (__stdout.includes("Docker version")) {
          return new Promise((resolve, reject) => {
            const child_process = require("child_process");
            child_process.exec(`stat -c '%a %n' ${__dirname}/config.json`,(error, __stdout, __stderr) => {
                resolve(__stdout);
                if (!error) {
                  if (__stdout !== `777 ${__dirname}/config.json`) {
                    child_process.exec(`sudo chmod -R 777 ${__dirname}/config.json`,(error, stdout, stderr) => {
                        resolve(stdout);
                      }
                    );
                  } else {
                    resolve(true);
                  }
                }
              }
            );

            const _cliProgress = require('cli-progress');
            let progress = 1;
            let progressInterval;
            const progressbar = new _cliProgress.Bar({
                format: "Progress [{bar}] {percentage}%"
              },
              _cliProgress.Presets.shades_classic
            );

            return new Promise((resolve, reject) => {
              docker.pull(IMAGE_TAG, (dockerPullError, dockerPullStream) => {
                if (dockerPullError) {
                  console.log(Helper.outputError("Make sure you have added docker to the USER group"));
                  reject(dockerPullError);
                  process.exit();
                }
                else{
                  console.log("setting up tezos node, this could take a while....");      
                  progressInterval = setInterval(() => {
                    progressbar.start(100, progress);
                    progress = progress + 0.55;
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
                      console.log(Helper.output("\nTezos nodes have been setup successfully on system...."));                    
                      if (error) {
                        return reject(__dockerModemError);
                      }
                        resolve(__dockerModemOutput);
                        process.exit();
                      });                   
                      return resolve(dockerPullStream);                    
                    }
                  });              
                });
              });
          } else {
            console.log(
              Helper.outputError(
                "Docker not detected on the system please install docker...."
              )
            );
          }
      });
    }

  startNodes() {
  child_process.exec(`docker images ${IMAGE_TAG} --format "{{.Repository}}:{{.Tag}}:{{.Size}}"`,
    (error, __stdout, __stderr) => {
      if (__stdout === `${IMAGE_TAG}:2.75GB\n`) {

        child_process.exec(`docker ps -a -q  --filter ancestor=${IMAGE_TAG} --format "{{.Image}}:{{.Names}}"`,
        (error, __stdout, __stderr) => {
          if (__stdout.includes(`${IMAGE_TAG}:${CONTAINER_NAME}\n`)) 
            {
              console.log(Helper.outputInfo("Nodes are already running...."));
            }
            else{
              const _cliProgress = require('cli-progress');
              console.log("starting the nodes.....");
              let progress = 0;
              let progressInterval;
              const progressbar = new _cliProgress.Bar({
                  format: "Progress [{bar}] {percentage}%"
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

              setTimeout(() => {
              const myInterval = setInterval(() =>{
                const request = require('request');
                request('http://localhost:18731/chains/main/blocks/head/protocols', function (error, response, body) {
                var data = JSON.parse(body);
                if(data.protocol.startsWith("PsBaby")){
                  progressbar.update(100);
                  progressbar.stop();
                  console.log(Helper.output("Nodes have been started successfully...."));
                  clearInterval(myInterval);
                  process.exit();
                }
                });
              },1000);
              },5000);

              return new Promise((resolve, reject) => {
              docker.createContainer({
                name: `${CONTAINER_NAME}`,
                Image: `${IMAGE_TAG}`,
                Tty: true,
                ExposedPorts: {
                  "18731/tchild_process:": {}
                },
                PortBindings: {
                  "18731/tchild_process": [{
                    HostPort: "18731"
                  }]
                },
                NetworkMode: "host",
                Cmd: [
                  "/bin/bash",
                  "-c",
                  "cd /usr/local/bin && start_nodes.sh && tail -f /dev/null"
                ]
              },
              function(err, container) {
                container.start({}, function(err, data) {              
                  if (err)
                  console.log(Helper.outputError("Check whether docker is installed or not"));
                });
              });
          });
          }
      });
        }
        else {
          console.log(
            Helper.outputError(
              "No inbuilt nodes found on system. Run 'tezster setup' comamnd for build the nodes."));
        }
      });
  }

  stopNodes(){
    child_process.exec(`docker ps -a -q --format "{{.Image}}"`,
    (error, __stdout, __stderr) => {
        if (__stdout.includes(`${IMAGE_TAG}\n`)) 
        {
          console.log("stopping the nodes....");
          const container = docker.getContainer(CONTAINER_NAME);
          docker.listContainers(function(err, containers) {
          container.stop(); 
          container.remove({force: true});
          console.log(Helper.outputInfo("Nodes have been stopped. Run 'tezster start-nodes' to restart."));
        });
        }
        else
          console.log(Helper.outputError("No Nodes are running...."));   
    });
  }

}

module.exports = { Setup };