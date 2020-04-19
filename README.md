# Tezster-CLI

<img src="https://tezster.s3-ap-southeast-1.amazonaws.com/TEZSTER_CLI/1_jDB5enULQVo2UfeiwD32qA.png" alt="Tezster CLI banner" align="center" />
<div align="center"><strong>A complete toolbox to build, deploy and interact with the applications on Tezos sandbox and Tezos testnets.</strong></div>
<div align="center">Tezster-CLI comes in an npm package with a set of easy commands to kickstart the development or interaction with Tezos blockchain. It allows you to interact with local nodes as well as remore testnet nodes and deploy or call smart contracts. To get complete understanding of components usage and visual demo follow <a href="https://docs.tezster.tech/tezster-cli">Tezster-CLI Guide</a> 
</div>

# Getting Started
Follow below steps to get started with Tezster-CLI.

## Prerequisites

1. Node v. 12.x+
2. Install Docker

### OS Support
1. Linux (Ubuntu and Debian)
2. Mac OS X
3. Windows 10 <br />

*Note : We recommend linux platform for tezster cli. You may encounter some issues in OSX and Windows 10 due to docker. If you face any please report in our [issues section](https://github.com/Tezsure/Tezster-CLI/issues).*

### Node.js Installation
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

### Docker Installation
For Ubuntu/Linux run :  ```sudo apt install docker.io``` <br />
For Debian refer this [link](https://docs.docker.com/engine/install/debian/). <br />
For MAC refer this [link](https://docs.docker.com/docker-for-mac/release-notes/#docker-desktop-community-2105). (Docker Desktop v2.1.0.5 or earlier) <br />
For Windows (Win-10 enterprise edition) refer this [link](https://docs.docker.com/docker-for-windows/release-notes/#docker-desktop-community-2105). (Docker Desktop v2.1.0.5 or earlier) <br />
For Windows (Win-10 home edition or older) refer this [link](https://docs.docker.com/toolbox/toolbox_install_windows/).


### Post docker installation step
Make sure after installing docker you have added $USER to the docker group, if not run the following commands:

```
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

## Clone repository

To clone the repository use the following commands:

```
git clone https://github.com/Tezsure/Tezster-CLI.git
cd Tezster-CLI
npm install
sudo npm link
```

Run ```tezster --version``` to ensure the version of tezster.
```
tezster --version
```

To list down all the tezster commands, run:
```
tezster --help
```

Now you can run all the tezster commands. For usage guidance follow our [documentation page](https://docs.tezster.tech/tezster-cli#local-node-setup).

## NPM Package

You can install tezster-cli using npm package as well. To install npm package, run:
```
sudo npm install -g tezster@latest
```

Run ```tezster --version``` to ensure the version of tezster.
```
tezster --version
```

To list down all the tezster commands, run:
```
tezster --help
```

To setup tezster-cli and for usage guidance visit our [documentation page](https://docs.tezster.tech/tezster-cli#playground-setup).


## Extra

We’re building a lot of exciting features which will be released soon, So stay tuned with our updates and releases!

```
keep developing
```

**Please go through our [error section](https://docs.tezster.tech/tezster-cli#common-errors-with-possible-fix) to get information about the common errors and fixes. For any help or to report any issues please follow the [link](https://github.com/Tezsure/Tezster-CLI/issues).**