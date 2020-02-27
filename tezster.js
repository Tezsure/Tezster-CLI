#!/usr/bin/env node
'use strict';

const childprocess = require("child_process");
const program = require("commander");
const Docker = require("dockerode");
var docker = new Docker({ socketPath: "/var/run/docker.sock" });
const tezsterManager = require("./tezster-manager");
const imageTag = "tezsureinc/tezster:1.0.0";
const containerName = "tezster";

program
  .version('0.1.9', '-v, --version')
  .command('setup')
  .description('To set up Tezos nodes')
  .action(function() {
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
  });

program.command('start-nodes')
.description('Starts Tezos nodes')
.action(function() {
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
});

program.command('stop-nodes')
.description('Stops Tezos nodes')
.action(function() {
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
});

//*******for check the balance check */
program
.command('get-balance')
.usage('<account/contract(pkh)>')
.description('To get the balance of account/contracts')
.action(async function(){
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 1) {
        console.log(tezsterManager.outputInfo("Incorrect usage of get-balance command \n Correct usage: - tezster get-balance account/contract"));
        return;
    }
    await tezsterManager.loadTezsterConfig();
    tezsterManager.getBalance(args[0]).then((result) => {
        console.log(result);
    });
});

//******* To get the list accounts */
program
.command('list-accounts')
.description('To fetch all the accounts')
.action(async function(){    
    const tezsterManager = require('./tezster-manager');    
    await tezsterManager.loadTezsterConfig();
    const config = tezsterManager.config;
    if(Object.keys(config.accounts).length > 0){
        for(var i in config.accounts){
            console.log(tezsterManager.output(config.accounts[i].label + " - " + config.accounts[i].pkh + " (" + config.accounts[i].identity + ")"));
        }
    }
    else{    
        console.log(tezsterManager.outputError("No Account is available !!"));        
    }
});

//******* TO get the list Contracts */
program
.command('list-contracts')
.description('To fetch all the contracts')
.action(async function(){     
    const tezsterManager = require('./tezster-manager');       
    await tezsterManager.loadTezsterConfig();    
    const config = tezsterManager.config;
    if(Object.keys(config.contracts).length > 0){        
        for(var i in config.contracts){
            console.log(tezsterManager.output(config.contracts[i].label + " - " + config.contracts[i].pkh + " (" + config.contracts[i].identity + ")"));        
        }
    }
    else{
        console.log(tezsterManager.outputError("No Contracts are Available !!"));        
    }
});

//******* To get the Provider */
program
.command('get-provider')
.description('To fetch the current provider')
.action(async function(){        
    const tezsterManager = require('./tezster-manager');    
    await tezsterManager.loadTezsterConfig(); 
    console.log(tezsterManager.getProvider());
});


//******* To set the Provider */
program
.command('set-provider')
.usage('[http://<ip>:<port>]')
.description('To change the default provider')
.action(async function(){  
    var args = process.argv.slice(3);  
    const tezsterManager = require('./tezster-manager');  
    if (args.length < 1){ 
        console.log(tezsterManager.outputError("Incorrect usage - tezster set-provider http://{ip}:{port}"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    console.log(tezsterManager.setProvider(args));
});

//******* To transfer the amount */
program
.command('transfer')
.usage('<amount> <from> <to>')
.description('To transfer the funds between accounts')
.action(async function(){  
    var args = process.argv.slice(3);  
    const tezsterManager = require('./tezster-manager');
    if (args.length < 2) {
        console.log(tezsterManager.outputError("Incorrect usage - tezster transfer <amount> <from> <to> <fees>"));
        return;
    }
    await tezsterManager.loadTezsterConfig();
    tezsterManager.transferAmount(args).then((result) => {        
        console.log(result);
    });
});

//*******deploy contract written in Michelson*/
program
.command('deploy')
.usage('<contract-label> <contract-absolute-path> <init-storage-value> <account>')
.description('Deploys a smart contract written in Michelson')
.action(async function(){
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 4) {
        console.log(tezsterManager.outputInfo("Incorrect usage of deploy command \n Correct usage: - tezster deploy contract-label contract-absolute-path init-storage-value account"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 

    let result = await tezsterManager.deployContract(args[0], args[1], args[2], args[3]);
    console.log(result);
    console.log(tezsterManager.outputInfo(`If you're using babylonnet node, use https://babylonnet.tzstats.com to check contract/transactions`));
});

//*******calls contract written in Michelson*/
program
.command('call')
.usage('<contract-name/address> <argument-value> <account>')
.description('Calls a smart contract with given value provided in Michelson format')
.action(async function(){
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 3) {
        console.log(tezsterManager.outputInfo("Incorrect usage of call command \n Correct usage: - tezster call contract-name argument-value account"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    
    let result = await tezsterManager.invokeContract(args[0], args[1], args[2]);
    console.log(result);
    console.log(tezsterManager.outputInfo(`If you're using babylonnet node, use https://babylonnet.tzstats.com to check contract/transactions`));
});

//*******gets storage for a contract*/
program
.command('get-storage')
.usage('<contract-name/address>')
.description('Returns current storage for given smart contract')
.action(async function(){
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 1) {
        console.log(tezsterManager.outputInfo("Incorrect usage of get-storage command \n Correct usage: - tezster get-storage contract-name"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    
    let result = await tezsterManager.getStorage(args[0]);
    console.log(result);
});

/* Restores an testnet faucet account */
program
.command('add-testnet-account')
.usage('<account-label> <absolut-path-to-json-file>')
.description('Restores a testnet faucet account from json file')
.action(async function(){
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 2) {
        console.log(tezsterManager.outputInfo("Incorrect usage of add-testnet-account command \n Correct usage: - tezster add-testnet-account <account-label> <absolut-path-to-json-file>"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    
    let result = tezsterManager.restoreAlphanetAccount(args[0], args[1]);
    console.log(result);
});

/* Restores an testnet faucet account */
program
.command('activate-testnet-account')
.usage('<account-label>')
.description('Activates a testnet faucet account resored using tezster')
.action(async function(){
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 1) {
        console.log(tezsterManager.outputInfo("Incorrect usage of activate-testnet-account command \n Correct usage: - tezster activate-testnet-account <account-label>"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    
    let result = await tezsterManager.activateAlphanetAccount(args[0]);
    console.log(result);
    console.log(tezsterManager.outputInfo(`If this account has already been activated, it may throw 'invalid_activation' error. You can visit https://babylonnet.tzstats.com for more information on this account`));
});

/* list transactions done with tezster */
program
.command('list-transactions')
.description('List down all the transactions')
.action(async function(){  
    const tezsterManager = require('./tezster-manager');       
    await tezsterManager.loadTezsterConfig();    
    const config = tezsterManager.config;

    console.log(tezsterManager.outputInfo('For transactions done on babylonnet node ,you can visit https://babylonnet.tzstats.com for more information'))
    if(Object.keys(config.transactions).length > 0){        
        for(var i in config.transactions){
            console.log(tezsterManager.output(JSON.stringify(config.transactions[i])));        
        }
    } else{
        console.log(tezsterManager.outputError("No transactions are Available !!"));        
    }
});

//******* To Create an account */
program
.command('create-account')
.usage('<identity> <label> <amount>')
.description('To create a new account')
.action(async function(){  
    var args = process.argv.slice(3);  
    const tezsterManager = require('./tezster-manager');
    if (args.length < 3) return console.log(tezsterManager.outputError("Incorrect usage - tezster create-account <Identity> <Account Label> <amount> <spendable=true[Optional]> <delegatable=true[Optional]> <delegate[Optional]> <fee=0[Optional]>"));
    await tezsterManager.loadTezsterConfig(); 
    tezsterManager.createAccount(args).then((result) => {
        console.log(result);
    });
          
});

//******* To Create an account */
program
.command('add-contract')
.usage('<label> <address>')
.description('Adds a smart contract with label for interaction')
.action(async function(){  
    var args = process.argv.slice(3);  
    const tezsterManager = require('./tezster-manager');
    if (args.length < 2) return console.log(tezsterManager.outputError("Incorrect usage - tezster add-contract <label> <Address>"));
    await tezsterManager.loadTezsterConfig();
    console.log(tezsterManager.addContract(args[0], args[1], ''));          
});

program
.on("--help", () => {
  console.log("\nTo know more about particular command usage:\n\ttezster [command] --help");
});

if (process.argv.length <= 2){
    console.log('\x1b[31m%s\x1b[0m', "Error: " +"Please enter a command!");
}
var commands=process.argv[2];
const validCommands = [  "list-Identities",
"list-accounts",
"list-contracts",
"get-balance",
"transfer",
"set-provider",
"get-provider",
"stop-nodes",
"start-nodes",
"setup",
"call",
"deploy",
"help",
"create-account",
"list-transactions",
"get-storage",
"add-testnet-account",
"activate-testnet-account",
"add-contract",
"-v",
"--version",
"--help",
"-h"];
if (validCommands.indexOf(commands) < 0 && process.argv.length >2 ) {
    const availableCommands = validCommands.filter(elem => elem.indexOf(commands) > -1);
    console.log('\x1b[31m%s\x1b[0m', "Error: " + "Invalid command\nPlease run 'tezster --help' to get info about commands ");    
    console.log("\nThe most similar commands are:");
    console.log("\t"+availableCommands.toString().replace(/,/g,"\n\t"));    
}

program.parse(process.argv);
