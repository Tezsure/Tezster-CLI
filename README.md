# Tezster
A personal development blockchain based on Javascript that lives entirely on your local machine. It will come as either a CLI with integrated GUI, has log output, and the ability to run transactions or deploy contracts against the local machine node or state of a live network such as the alphanet, without spending any XTZ.

## Getting started

Tezster comes in an npm package with a set of easy commands to kickstart the development or interaction with Tezos. The current beta version will install and start tezos node on your local machine.

### Prerequisites

Latest version of Debian or Ubuntu. Windows users can run debian or ubuntu on

1. Virtual  machine (eg.- VirtualBox)
2. VM instance on cloud (eg.- Google cloud platform or AWS)

### Installing

download the npm package

```
sudo npm install -g tezster-beta@latest
```

Once it is installed run

```
sudo tezster setup
```
This may take upto 30 mins depending upon the internet connection. It will download and install the Tezos blockchain.
Once it's done, you will get appropriate message. You need to run setup only once. After that run, 

```
sudo tezster start-nodes
```
It will activate Tezos alpha. Now you will have two nodes running successfully on port 18731 and 18732. To see the nodes running 
run following command as the root (super user)

```
sudo lsof -i :18731
```
To stop the nodes run

```
sudo tezster stop-nodes
```
To see generated accounts, run

```
tezster list-accounts
```
To transfer tezos from account to another, run

```
tezster transfer <amount> <from> <to> 
eg. - tezster transfer 10 boottsrap1 bootstrap2

then bake the transaction via,

tezster bake-for bootstrap1
```

To see what you can do with tezster, run

```
tezster --help
```

### Extra

Coming soon.

```
keep developing
```
![image](tzaddr.PNG)

