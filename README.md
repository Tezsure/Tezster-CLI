# Tezster-CLI

<img src="https://tezster.s3-ap-southeast-1.amazonaws.com/TEZSTER_CLI/1_jDB5enULQVo2UfeiwD32qA.png" alt="Tezster CLI banner" align="center" />
<div align="center"><strong>A complete toolbox to build, deploy and interact with the applications on Tezos sandbox and Tezos testnets.</strong></div>
<div align="center">Tezster-CLI comes in an npm package with a set of easy commands to kickstart the development or interaction with Tezos blockchain. It allows you to interact with local nodes as well as remote testnet nodes and deploy or call smart contracts. To get complete understanding of components usage and visual demo follow <a href="https://docs.tezster.tech/tezster-cli"><strong>Tezster-CLI Guide</strong></a>.
</div>

# Getting Started
Follow below steps to get started with Tezster-CLI.

## Prerequisites

1. Node v. 12.x+
2. Docker v. 2.3.0.2+

### OS Support
1. Linux (Ubuntu and Debian)
2. Mac OS X
3. Windows 10 <br />

### Node.js Installation
Run following commands to install Node.js LTS version (for linux based platforms) or can download nodejs from [Downloads](https://nodejs.org/en/download/).
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
For MAC refer this [link](https://docs.docker.com/docker-for-mac/release-notes/#docker-desktop-community-2303). (Docker Desktop stable v2.3.0.2 or later) <br />

*Note: If you are using **windows**, please follow docker installation steps as detailed in [docker installation steps for windows](https://docs.tezster.tech/tezster-cli#docker-installation-steps-for-windows).*

### Post Docker Installation Guide (Skip if using windows or docker-desktop)
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

Congratulations, you are all set to use Tezster-CLI commands. For usage guidance follow our **[documentation page](https://docs.tezster.tech/tezster-cli#playground-setup)**.


## Contributing

Tezster-CLI is open source and we love to receive contributions from whosoever passionate with the technology.

There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, bug reports and feature requests or writing code. We certainly welcome pull requests as well.


### Reporting bugs and Support

To know about common errors and fixes follow our [error section](https://docs.tezster.tech/tezster-cli#common-errors-with-possible-fix). To report bugs, please create an issue on [issue page](https://github.com/Tezsure/Tezster-CLI/issues).

**You can get in touch with us for any open discussion and 24*7 support through our [telegram channel](https://t.me/tezster).**


## Extra

We’re building a lot of exciting features which will be released soon, So stay tuned with our updates and releases!

```
keep developing
```