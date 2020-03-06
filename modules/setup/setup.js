const childprocess = require("child_process");
const {Helper} = require('../../helper');

const Docker = require("dockerode");
var docker = new Docker({ socketPath: "/var/run/docker.sock" });
const imageTag = "tezsureinc/tezster:1.0.0";
const containerName = "tezster";

class Setup{

constructor(){  
    this.helper = new Helper();
}

_setup() {
    console.log(this.helper.outputInfo(
      "We may need your password for write permission in config file...."
    ));

    childprocess.exec(`docker --version`, (error, __stdout, __stderr) => {
      if (__stdout.includes("Docker version")) {
        return new Promise((resolve, reject) => {
          const childprocess = require("child_process");
          childprocess.exec(`stat -c '%a %n' ${__dirname}/config.json`,(error, __stdout, __stderr) => {
              resolve(__stdout);
              if (!error) {
                if (__stdout !== `777 ${__dirname}/config.json`) {
                  childprocess.exec(`sudo chmod -R 777 ${__dirname}/config.json`,(error, stdout, stderr) => {
                      resolve(stdout);
                    }
                  );
                } else {
                  resolve(true);
                }
              }
            }
          );

          const _cliProgress = require("cli-progress");
          let progress = 1;
          let progressInterval;
          const progressbar = new _cliProgress.Bar({
              format: "Progress [{bar}] {percentage}%"
            },
            _cliProgress.Presets.shades_classic
          );

          return new Promise((resolve, reject) => {
            docker.pull(imageTag, (dockerPullError, dockerPullStream) => {
              if (dockerPullError) {
                console.log(this.helper.outputError("Make sure you have added docker to the USER group"));
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
                    console.log(this.helper.output("\nTezos nodes have been setup successfully on system...."));                    
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
            this.helper.outputError(
              "Docker not detected on the system please install docker...."
            )
          );
        }
    });
  }

_startNodes() {
childprocess.exec(`docker images ${imageTag} --format "{{.Repository}}:{{.Tag}}:{{.Size}}"`,
  (error, __stdout, __stderr) => {
    if (__stdout === `${imageTag}:2.75GB\n`) {

      childprocess.exec(`docker ps -a -q  --filter ancestor=${imageTag} --format "{{.Image}}:{{.Names}}"`,
      (error, __stdout, __stderr) => {
        if (__stdout.includes(`${imageTag}:${containerName}\n`)) 
          {
            console.log(this.helper.outputInfo("Nodes are already running...."));
          }
          else{
            const _cliProgress = require("cli-progress");
            var self = this;
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
                console.log(self.helper.output("Nodes have been started successfully...."));
                clearInterval(myInterval);
                process.exit();
              }
              });
            },1000);
            },5000);

            return new Promise((resolve, reject) => {
            docker.createContainer({
              name: `${containerName}`,
              Image: `${imageTag}`,
              Tty: true,
              ExposedPorts: {
                "18731/tchildprocess:": {}
              },
              PortBindings: {
                "18731/tchildprocess": [{
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
                console.log(self.helper.outputError("Check whether docker is installed or not"));
              });
            });
        });
        }
    });
      }
      else {
        console.log(
          this.helper.outputError(
            "No inbuilt nodes found on system. Run 'tezster setup' comamnd for build the nodes."));
      }
    });
}

_stopNodes(){
  childprocess.exec(`docker ps -a -q --format "{{.Image}}"`,
  (error, __stdout, __stderr) => {
      if (__stdout.includes(`${imageTag}\n`)) 
      {
        console.log("stopping the nodes....");
        var self = this;
        const container = docker.getContainer(containerName);
        docker.listContainers(function(err, containers) {
        container.stop(); 
        container.remove({force: true});
        console.log(self.helper.outputInfo("Nodes have been stopped. Run 'tezster start-nodes' to restart."));
      });
      }
      else
        console.log(this.helper.outputError("No Nodes are running...."));   
  });
}

}

module.exports = { Setup };