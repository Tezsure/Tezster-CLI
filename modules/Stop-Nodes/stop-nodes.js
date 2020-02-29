const childprocess = require("child_process");
const tezsterManager = require("../../tezster-manager");

const Docker = require("dockerode");
var docker = new Docker({ socketPath: "/var/run/docker.sock" });

const imageTag = "tezsureinc/tezster:1.0.0";
const containerName = "tezster";

function stopNodes(){
    childprocess.exec(`docker ps -a -q --format "{{.Image}}"`,
    (error, __stdout, __stderr) => {
        if (__stdout.includes(`${imageTag}\n`)) 
        {
          console.log("stopping the nodes....");
          const container = docker.getContainer(containerName) 
          docker.listContainers(function(err, containers) {
          container.stop(); 
          container.remove({force: true});
          console.log(tezsterManager.outputInfo("Nodes have been stopped. Run 'tezster start-nodes' to restart."));
        });
        }
        else
          console.log(tezsterManager.outputError("No Nodes are running...."));   
    });
}

module.exports = { stopNodes };