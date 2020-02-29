const childprocess = require("child_process");
const tezsterManager = require("../../tezster-manager");

const Docker = require("dockerode");
var docker = new Docker({ socketPath: "/var/run/docker.sock" });

const imageTag = "tezsureinc/tezster:1.0.0";
const containerName = "tezster";

function setup() {
    console.log(tezsterManager.outputInfo(
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
                console.log(tezsterManager.outputError("Make sure you have added docker to the USER group"));
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
                    console.log(tezsterManager.output("\nTezos nodes have been setup successfully on system...."));                    
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
            tezsterManager.outputError(
              "Docker not detected on the system please install docker...."
            )
          );
        }
    });
  }

module.exports = { setup };