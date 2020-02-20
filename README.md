# Tezster 2.0
A personal development blockchain based on Javascript that lives entirely on your local machine.

## Getting Super Powers

Tezster comes in an npm package with a set of easy commands to kickstart the development or interaction with Tezos. The current version will install and start tezos node on your local machine.

### Prerequisites

Any Operating System will work !

1. Node v. 12.x+
2. Install Docker ( For Ubuntu/Linux use ``` sudo apt install docker.io ```, For MacBook you can use "docker desktop")

#### Note:
Make sure after installing docker you have added \$USER to the docker group, if not follow the following steps:

```
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

### Playground Setup :

download the npm package

```
sudo npm install -g tezster@latest
```
You can check the version of tezster using :

```
tezster -v
```
Once it is installed run

```
tezster setup
```
This will download the docker image containing 'pre-built tezos nodes and baker' on your system. You need to run setup only once. After that run,

```
tezster start-nodes
```
It will activate Tezos alpha. Now you will have nodes running successfully on port 18731.


To stop the nodes run

```
tezster stop-nodes
```
It will stop all the tezster nodes running on the system. To restart the nodes run "tezster start-nodes".


### Play with Tezster CLI 

To see generated accounts, run

```
tezster list-accounts
``` 
User can also activate and use an babylonnet faucet account with tezster to interact with babylonnet (test network of tezos) user has to download file from faucet : https://faucet.tzalpha.net/ After downloading from faucet you need to change the provider.

To check your current provider run

```
tezster get-provider

```
Change your provider to localhost by running

```
tezster set-provider http://localhost:18731
```

Change your provider to babylonnet by running

```
tezster set-provider https://tezos-dev.cryptonomic-infra.tech/

```

Change your provider to online tezster node :

```
tezster set-provider http://testnet.tezster.tech

```


```
add-testnet-account <account-label> <absolute-path-to-json-file> - restores account from faucet json file
e.g. tezster add-testnet-account alpha4 /home/op/Downloads/tz1Umt3KQUwZYyjFjJrRXjp17qosuxAkmf3n.json

```
Any testnet faucet account requires activation before first use.

```
 activate-testnet-account <account-label>
e.g. tezster activate-testnet-account alpha4

```

After activating faucet you need to change the provider to check your current provider run:

```
tezster get-provider

```

To transfer tezos from account to another account , you don't have to bake your blocks because a baker is running for your local node and it bakes automatically.
```
tezster transfer <amount> <from> <to> 
eg. - tezster transfer 10 bootstrap1 bootstrap2

```
To deploy a smart contract, put the michelson code in  a file (eg.- testcontract.tz) Code eg.-

```
parameter string;
storage string;
code {CAR; NIL operation; PAIR;};

```
this stores any string to the storage

then run,

```
tezster deploy <contract label> <absolute path> <initial storage value> <account>

eg.- tezster deploy simplecontract /home/op/testcontract.tz "\"helloworld\"" bootstrap1

```
if this is successful, you'll receive a contract hash.

To call the contract, run

```
tezster call <contract label> <argument value> <account>
eg.- tezster call simplecontract "\"goodmorning\"" bootstrap1

```

To see the current storage in a contract, run

```
tezster get-storage <contract-label/address>
eg.- tezster get-storage simplecontract

```
You can call this after each step when you deploy or call contract to see the updated storage.

To see what you can do with tezster, run

```
tezster --help
```

### Extra

Coming soon.

```
keep developing
```






