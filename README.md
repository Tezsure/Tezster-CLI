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
Note : We recommend linux platform for tezster cli. You may encounter some issues in OSX and Windows 10 due to docker. If you face any please report in our [issues section](https://github.com/Tezsure/Tezster-CLI/issues).

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

## Getting Started

### Clone repository

To clone the repository use the following commands:

```
git clone https://github.com/Tezsure/Tezster-CLI.git
cd Tezster-CLI
npm install
sudo npm link
```

Now you can run all the tezster commands. Follow our [documentation](https://docs.tezster.tech/tezster-cli#local-node-setup).

## Tezster-CLI using NPM Package

To setup tezster-cli using npm package visit our [documenttaion page](https://docs.tezster.tech/tezster-cli#playground-setup) and follow the procedure.


## Extra

We’re building a lot of exciting features which will be released soon, So stay tuned with our updates and releases!

```
keep developing
```

**For error guidance refer to our [error section](https://docs.tezster.tech/tezster-cli#common-errors-with-possible-fix).**