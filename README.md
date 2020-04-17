# Tezster 2.0 - CLI
A complete testing setup to build, deploy and interact with applications on Tezos sandbox and Tezos testnets.

## Getting Super Powers

Tezster comes in an npm package with a set of easy commands to kickstart the development or interaction with Tezos. The current version will install and start tezos node on your local machine.

### Prerequisites

1. Node v. 12.x+
2. Install Docker 

#### OS Support
1. Linux (Ubuntu and Debian)
2. Mac OS X
3. Windows 10 <br />
Note : There might be some issues with Mac OS & Windows 10. If you face any please report in our [issues section](https://github.com/Tezsure/Tezster-CLI/issues).

#### Node.js Installation
Run following commands to install Node.js LTS version 
```
sudo apt-get update
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install nodejs
```
After installing verify and check the installed version.
```
node -v 
```

#### Docker Installation
For Ubuntu/Linux run :  sudo apt install docker.io <br />
For Debian refer this [link](https://docs.docker.com/engine/install/debian/). <br />
For MAC refer this [link](https://docs.docker.com/docker-for-mac/release-notes/#docker-desktop-community-2105). (Docker Desktop v2.1.0.5 or earlier) <br />
For Windows (Win-10 enterprise edition) refer this [link](https://docs.docker.com/docker-for-windows/release-notes/#docker-desktop-community-2105). (Docker Desktop v2.1.0.5 or earlier) <br />
For Windows (Win-10 home edition or older) refer this [link](https://docs.docker.com/toolbox/toolbox_install_windows/).


#### Post docker installation step
Make sure after installing docker you have added $USER to the docker group, if not run the following commands:

```
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

## Playground Setup

### Install NPM package

```
sudo npm install -g tezster@latest
```
Run ```tezster --version``` to ensure the installed version of tezster.

```
tezster --version
```

To list down all the tezster commands, run:

```
tezster --help
```

To know about usage for any particular command, run

```
tezster <command-name> --help
e.g. tezster deploy --help
```

### Local Node Setup

#### Setup
Setting up local nodes will create tezos network on your machine along with baker. You always have an option to switch to remote nodes using tezster. After tezster successfully installed, Tezos nodes need to be setup on the local machine.

```
tezster setup
```
*This will download the docker image containing 'pre-built tezos nodes and baker' on your system. You need to run setup only once.*

#### Start Local Nodes
After building nodes, start tezos nodes:
```
tezster start-nodes
```
*It will activate Tezos alpha on local machine. Now Nodes are running successfully on port 18731.*

#### Stop Local Nodes
To stop the nodes, run:

```
tezster stop-nodes
```
*It will stop all the tezster nodes running on the system. To restart the nodes run "tezster start-nodes".*

#### Local Node Status
To know about local node status whether they are in running state or not, run:
````
tezster node-status
````

### Logs

To get the logs of running node & baker, please run ...

```
tezster get-logs
```

```
It will save logs as archieve file format at - "/tmp/tezster-logs/tezster-node-logs.tar.gz".
To unzip use command - "tar -xf tezster-node-logs.tar.gz" inside "/tmp/tezster-logs" folder.
```
*It will collect local node related logs on your system and do collect after starting the local nodes.*

## Play with Tezster CLI 

### Switch Provider

*Node Providers are those who serves Blockchain as a Service and helps to connect to a Node.*

A lot of providers are running Tezos Nodes. You can switch to your node provider as per your convenience (local node or remote node). By default we are providing local node - http://localhost:18731.

#### Get Provider
To check your current provider, run:

```
tezster get-provider
```

#### Set Provider
Change your provider to local nodes by running:

````
tezster set-provider http://localhost:18731
````

If you want to use remote nodes, switch your provider to Carthagenet by changing provider to - https://testnet.tezster.tech

````
tezster set-provider https://testnet.tezster.tech
````

Some other Carthagenet providers are:

````
https://carthagenet.SmartPy.io
http://carthagenet.tezos.cryptium.ch:8732
https://tezos-dev.cryptonomic-infra.tech
````

### Faucet Account Activation

*We are providing 5 bootstrap accounts which are activated and have sufficient balance. These bootstrap accounts can be used only for local nodes.*

#### List Accounts
To list down all the generated accounts, run:
````
tezster list-accounts
````

#### Add Testnet Faucet Account
User can also activate and use their own account with tezster to interact with carthagenet (test network of tezos).

Before activating faucet account you need to change the provider to remote nodes. To check your current provider, run:
````
tezster get-provider
````

User has to download file from [faucet](https://faucet.tzalpha.net/). After downloading the account file ( tz1***.json) from faucet you need to add the testnet account:

```
add-testnet-account <account-label> <absolute-path-to-json-file> - restores account from faucet json file

e.g. tezster add-testnet-account alpha4 /home/op/Downloads/tz1Umt3KQUwZYyjFjJrRXjp17qosuxAkmf3n.json
```

#### Activate Testnet Faucet Account
Any testnet faucet account requires activation before first use. Make sure your current provider is set to remote nodes before activating the account. To activate the account, run:

```
activate-testnet-account <account-label>

e.g. tezster activate-testnet-account alpha4
```

#### Create Testnet Account
You can create Empty Testnet Account on localnode/remote node without need of faucet file. To create an account, run:

```
tezster create-account <account-label>
```
*It will create empty account which is not yet activated. After making transfer value it will activated account on network which is set to active provider.*

#### Transfer Amount
To transfer XTZs from one account to another account, run:

````
tezster transfer <amount> <from> <to> 

eg. - tezster transfer 10 bootstrap1 bootstrap2
````

*Once you do the transaction, the transaction needs to get baked in a block. For this you don't have to bake your blocks because a baker is running for your local node and it bakes automatically.*

#### Get Balance

To fetch balance for any listed account, run:
````
tezster get-balance <account-label/pkh/identity>
````

#### Remove Account
To remove activated account from the list, run:
````
tezster remove-account <account-label/pkh/identity>
````

### Smart Contract Operation

*Note: Tezster supports smart contracts in Michelson only.*

#### Deploy Contract
To deploy a smart contract, put the Michelson code in a file (eg.- testcontract.tz) Code e.g.-

````
parameter string;
storage string;
code {CAR; NIL operation; PAIR;};
````

*Code Description : This code stores a string to the storage.*

To deploy the smart contract on tezos network, run:

````
tezster deploy <contract label> <absolute path> <initial storage value> <account>

eg.- tezster deploy simplecontract /home/op/testcontract.tz "\"helloworld\"" bootstrap1

````
*If the operation is successful, you'll receive a contract address (KT1***).*

#### Call Contract
If you want to make any other transactions into already deployed contracts, then call the contract:
````
tezster call <contract label> <argument value> <account>

eg.- tezster call simplecontract "\"goodmorning\"" bootstrap1
````

#### Get Storage
To see the current storage in a contract, run:
````
tezster get-storage <contract-label/address>

eg.- tezster get-storage simplecontract
````
*You can check the updated storage after each step when you deploy or call contract.*

#### List Contracts
To list down all the deployed smart contracts using tezster, run
````
tezster list-contracts
````

##### Remove Contract
To remove previously deployed smart contract from the list, run:
````
tezster remove-contract <contract-label>
````

#### Complex smart contract

Copy the Michelson code from the [link](https://www.codepile.net/pile/w5OEK2ro) and paste in a file (eg.- event.tz).

#### Extract Entry Points
To extract all entry points and its corresponding parameters, run:
````
tezster extract-entry-points <absolute path>
````

#### Deploy Complex Smart Contract

To deploy contract using initial storage value, run:

````
tezster deploy <contract label> <absolute path> <initial storage value> <account> [options]

eg.- tezster deploy event /home/op/event.tz "(Pair {} "\"tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx\"")" bootstrap1
````

If you are willing to send some XTZs (Say 2 XTZs) into contract then, use options as:
````
tezster deploy event /home/op/event.tz "(Pair {} "\"tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx\"")" 
bootstrap1 --amount 2
````

*If the operation is successful, you'll receive a contract address (KT1***).*

#### Call Complex Smart Contract

Again to call the contract, run:

````
tezster call <contract label> <argument value> <account>

eg.- tezster call event "(Right (Left (Pair "\"event1\"" "\"December\"")))" bootstrap1
````

*Note : <argument value> for an entry-point can be obtained using : "tezster extract-entry-points <absolute path>"*

To see the current storage of the contract, run:
````
tezster get-storage <contract-label/address>

eg.- tezster get-storage event
````

## Tezster Bundle Integration

**Developing DApps? Use [Tezster Bundles](https://github.com/Tezsure/Bundle-react) for better Experience :**

* Clone the [repo](https://github.com/Tezsure/Bundle-react), you’ll get a React-ready Front-end , with Local compilation of SmartPy Code and Deployment feature.
* It comes with 4 Bootstrap Accounts compatible with Tezster-CLI which can be used directly in the DApp.

**How to configure for Tezster-CLI :**

* Change the deploy_config.node : “http://localhost:18731” in the config.json file and the Local Tezster nodes will be used.

*Note : Once Tezster container is down all the deployed contracts & transactions will be lost. Please keep the Tezster-CLI running during the development process.*

## Extra

We’re building a lot of exciting features which will be released soon, So stay tuned with our updates and releases!

```
keep developing
```

For more deatiled description and error guidance refer to our [detailed documetation](https://cli.tezster.tech/).