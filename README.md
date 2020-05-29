# Tezster-CLI

<img src="https://tezster.s3-ap-southeast-1.amazonaws.com/TEZSTER_CLI/1_jDB5enULQVo2UfeiwD32qA.png" alt="Tezster CLI banner" align="center" />
<div align="center"><strong>A complete toolbox to build, deploy and interact with the applications on Tezos sandbox and Tezos testnets.</strong></div>
<div align="center">Tezster-CLI comes in an npm package with a set of easy commands to kickstart the development or interaction with Tezos blockchain. It allows you to interact with local nodes as well as remote testnet nodes and deploy or call smart contracts. To get complete understanding of components usage and visual demo follow <a href="https://docs.tezster.tech/tezster-cli"><strong>Tezster-CLI Guide</strong></a>.
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

*Note : Currently we are supporting Linux platform for running local nodes. You may encounter local node related issues in Mac OS X and Windows due to docker. If you are on Mac OS X and Windows, you can switch to remote nodes to use our functionalities.*

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
*Note: If you got error message regarding permission denied, try install using ```sudo npm install -g tezster@latest --unsafe-perm=true```.*

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

**Please go through our [error section](https://docs.tezster.tech/tezster-cli#common-errors-with-possible-fix) to get information about the common errors and fixes. For any help or to report any issues please follow the [

## Contributing

Tezster-CLI is open source and we love to receive contributions from our community - you!

There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code. We certainly welcome pull requests as well.

## Reporting bugs and Support

To know about common errors and fixes follow our [error section](https://docs.tezster.tech/tezster-cli#common-errors-with-possible-fix). To report bugs, please create an issue on [issue page](https://github.com/Tezsure/Tezster-CLI/issues).

**You can get in touch with us for any open discussion and 24*7 support through our [telegram channel](https://t.me/tezster).**