const childprocess = require("child_process");
const tezsterManager = require("../../tezster-manager");

const Docker = require("dockerode");
var docker = new Docker({ socketPath: "/var/run/docker.sock" });

const imageTag = "tezsureinc/tezster:1.0.0";
const containerName = "tezster";

function startNodes() {
childprocess.exec(`docker images ${imageTag} --format "{{.Repository}}:{{.Tag}}:{{.Size}}"`,
  (error, __stdout, __stderr) => {
    if (__stdout === `${imageTag}:2.75GB\n`) {

      childprocess.exec(`docker ps -a -q  --filter ancestor=${imageTag} --format "{{.Image}}:{{.Names}}"`,
      (error, __stdout, __stderr) => {
        if (__stdout.includes(`${imageTag}:${containerName}\n`)) 
          {
            console.log(tezsterManager.outputInfo("Nodes are already running...."));
          }
          else{
            const _cliProgress = require("cli-progress");
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
                console.log(tezsterManager.output("Nodes have been started successfully...."));
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
                console.log(tezsterManager.outputError("Check whether docker is installed or not"));
              });
            });
        });
        }
    });
      }
      else {
        console.log(
          tezsterManager.outputError(
            "No inbuilt nodes found on system. Run 'tezster setup' comamnd for build the nodes."));
      }
    });
}

module.exports = { startNodes };