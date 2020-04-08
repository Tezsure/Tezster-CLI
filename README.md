# Tezster 2.0
A personal development blockchain based on Javascript that lives entirely on your local machine.

## Getting Super Powers

Tezster comes in an npm package with a set of easy commands to kickstart the development or interaction with Tezos. The current version will install and start tezos node on your local machine.

### Prerequisites

Any Operating System will work !

1. Node v. 12.x+
2. Install Docker 

#### Docker Installation
For Ubuntu/Linux use ``` sudo apt install docker.io ``` <br />
For MAC refer - https://docs.docker.com/docker-for-mac/install <br />
For Windows refer - https://docs.docker.com/docker-for-windows

#### Post docker installation step:
Make sure after installing docker you have added \$USER to the docker group, if not follow the following steps:

```
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

## Playground Setup :

### Installation

Download tezster npm package using

```
sudo npm install -g tezster@latest
```
Run ```tezster --version``` to ensure the installed version of tezster.

```
tezster --version
```

To list down all the tezster commands along with their description, run

```
tezster --help
```

To know about usage for any particular command, run

```
tezster <command-name> --help
e.g. tezster deploy --help
```

### Node Setup

After tezster successfully installed, Tezos nodes need to be setup on the machine.

```
tezster setup
```
This will download the docker image containing 'pre-built tezos nodes and baker' on your system. You need to run setup only once.

After building nodes, start tezos nodes

```
tezster start-nodes
```
It will activate Tezos alpha on local machine. Now Nodes are running successfully on port 18731.


To stop the nodes, run

```
tezster stop-nodes
```
It will stop all the tezster nodes running on the system. To restart the nodes run "tezster start-nodes".

#### Logs

To get nodes related log files, run

```
tezster get-logs
```

```
It will save logs as archieve file format at - "/tmp/tezster-logs/tezster-node-logs.tar.gz".
To unzip use command - "tar -xf tezster-node-logs.tar.gz" inside "/tmp/tezster-logs" folder.
```

## Play with Tezster CLI 

### Switch Provider

To check your active provider, run

```
tezster get-provider

```
Change your provider to localhost by running

```
tezster set-provider http://localhost:18731 
```

Change your provider to carthagenet by running

```
tezster set-provider http://testnet.tezster.tech

OR

tezster set-provider https://carthagenet.SmartPy.io 

```

### Faucet Account Activation

To list down ALL generated accounts, run

```
tezster list-accounts
``` 

User can also activate and use an carthagenet faucet account with tezster to interact with carthagenet (test network of tezos) user has to download file from faucet : https://faucet.tzalpha.net/ After downloading from faucet you need to change the provider.


```
add-testnet-account <account-label> <absolute-path-to-json-file> - restores account from faucet json file
e.g. tezster add-testnet-account alpha4 /home/op/Downloads/tz1Umt3KQUwZYyjFjJrRXjp17qosuxAkmf3n.json

```
Any testnet faucet account requires activation before first use. To activate testnet faucet account, run

```
activate-testnet-account <account-label>
e.g. tezster activate-testnet-account alpha4

```

After activating faucet you need to change the provider. To check your current provider run:

```
tezster get-provider

```

To transfer tezos from one account to another account
```
tezster transfer <amount> <from> <to> 
eg. - tezster transfer 10 bootstrap1 bootstrap2

```
You don't have to bake your blocks because a baker is running for your local node and it bakes automatically. 

### Smart Contract Operation

To deploy a smart contract, put the michelson code in  a file (eg.- testcontract.tz) Code eg.-

```
parameter string;
storage string;
code {CAR; NIL operation; PAIR;};

```
this code stores any string to the storage

To deploy the smart contract on tezos network run,

```
tezster deploy <contract label> <absolute path> <initial storage value> <account>

eg.- tezster deploy simplecontract /home/op/testcontract.tz "\"helloworld\"" bootstrap1

```
if this is successful, you'll receive a contract address.

If you want to make any other trasnactions into already deployed contracts, then call the contract

```
tezster call <contract label> <argument value> <account>
eg.- tezster call simplecontract "\"goodmorning\"" bootstrap1

```

To see the current storage in a contract, run

```
tezster get-storage <contract-label/address>
eg.- tezster get-storage simplecontract

```
You can check the updated storage after each step when you deploy or call contract.

To list down all deployed smart contracts, run

```
tezster list-contracts

```

#### Complex smart contract

Copy the michelson code from the link - https://www.codepile.net/pile/w5OEK2ro and copy in a file (eg.- calculator.tz) - 


To extract all entry points and initial storage format type, run

```
tezster extract-entry-points <absolute path>
```

To deploy contract using initial storage value, run

```
tezster deploy <contract label> <absolute path> <initial storage value> <account> [options]

eg.- tezster deploy calculator /home/op/calculator.tz "1" bootstrap1

If you are willing to send some tz (Say 2) into contract then, use options as

tezster deploy calculator /home/op/calculator.tz "1" bootstrap1 --amount 2

```
if contract deploy is successful, you'll receive a contract hash.

Again to call the contract, run

```
tezster call <contract label> <argument value> <account>
eg.- tezster call calculator "(Left (Right (Left 5)))" bootstrap1

Note : Argument value input format can be get by running ```tezster extract-entry-points <absolute path>```

```

To see the current storage in a contract, run

```
tezster get-storage <contract-label/address>
eg.- tezster get-storage calculator

```

### Extra

We’re building a lot of exciting features which will be released soon, So stay tuned with our updates and releases!

```
keep developing
```
