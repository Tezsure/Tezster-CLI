#!/usr/bin/env node
'use strict';

const childprocess = require("child_process");
const program = require("commander");
const Docker = require("dockerode");
var docker = new Docker({ socketPath: "/var/run/docker.sock" });
const tezsterManager = require("./tezster-manager");
var auxContainer;

program
  .version("0.1.9", "-v, --version")
  .command("setup")
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
            docker.pull("tezsureinc/tezster:1.0.0", (error, stream) => {
              console.log("setting up tezos node, this could take a while....");      
              progressInterval = setInterval(() => {
                progressbar.start(100, progress);
                progress = progress + 0.8;
                clearInterval(progress);
                if (progress >= 100) {
                  clearInterval(progressInterval);
                  progressbar.update(100);
                  progressbar.stop();
                  console.log(tezsterManager.output("Tezos nodes successfully built on system...."));
                  return;
                }
                progressbar.update(progress);
              }, 1000);
              if (error) {
                console.log(tezsterManager.outputError("Make sure you have added docker to the USER group"));
                process.exit();
                }
                return resolve(stream);
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

program.command("start-nodes").action(function() {
  childprocess.exec(`docker images tezsureinc/tezster --format "{{.Repository}}:{{.Tag}}:{{.Size}}"`,
    (error, __stdout, __stderr) => {
      if (__stdout === "tezsureinc/tezster:1.0.0:2.75GB\n") {

        childprocess.exec(`docker ps -a -q  --filter ancestor=tezsureinc/tezster:1.0.0 --format "{{.Image}}:{{.Names}}"`,
        (error, __stdout, __stderr) => {
            if (__stdout.includes("tezsureinc/tezster:1.0.0:tezster\n")) 
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
          progress = progress + 8;
          clearInterval(progress);
          if (progress >= 100) {
            clearInterval(progressInterval);
            progressbar.update(100);
            progressbar.stop();
            console.log(tezsterManager.output("Nodes are running...."));
            return;
          }
          progressbar.update(progress);
        }, 1000);

        return new Promise((resolve, reject) => {
          docker.createContainer({
              name: "tezster",
              Image: "tezsureinc/tezster:1.0.0",
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

program.command("stop-nodes").action(function() {
  childprocess.exec(`docker ps -a -q --format "{{.Image}}"`,
    (error, __stdout, __stderr) => {
        if (__stdout.includes("tezsureinc/tezster:1.0.0\n")) 
        {
            console.log("stopping the nodes....");
            childprocess.exec(`docker container stop $(docker container ls -q --filter name=tezster*) ; docker rm /tezster`,
            (error, __stdout, __stderr) => {
            console.log(tezsterManager.outputInfo("Nodes has been stopped. Run 'tezster start-nodes' to restart again."));
        });
    }
    else
        console.log(tezsterManager.outputError("No Nodes are running...."));   
  });
});

//*******for check the balance check */
program
.command('get-balance')
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
.action(async function(){        
    const tezsterManager = require('./tezster-manager');    
    await tezsterManager.loadTezsterConfig(); 
    console.log(tezsterManager.getProvider());
});


//******* To set the Provider */
program
.command('set-provider')
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
.action(async function(){  
    var args = process.argv.slice(3);  
    const tezsterManager = require('./tezster-manager');
    if (args.length < 2) return console.log(tezsterManager.outputError("Incorrect usage - tezster add-contract <label> <Address>"));
    await tezsterManager.loadTezsterConfig();
    console.log(tezsterManager.addContract(args[0], args[1], ''));          
});

program
.command('help')
.action(async function(){
    const tezsterManager = require('./tezster-manager');
    console.log(tezsterManager.helpData); //'\x1b[33m%s\x1b[0m',         
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
    console.log('\x1b[31m%s\x1b[0m', "Error: " + "Invalid command\nPlease run tezster help to get info about commands ");        
}

program.parse(process.argv);
