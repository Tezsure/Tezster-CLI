#!/bin/bash
source ./env.sh

function main {
    sudo apt-get -y update 
    sudo apt-get -y upgrade
    cleanup
    installDependencies
    installOpamIfNotFound
    setUpTezosRepoandBuildTezosNode
}

function findDependencyAndInstallIfNotFound {
    DEPENDENCYTOCHECK=$1
    echo "checking if $DEPENDENCYTOCHECK is installed or not...."
    if ! [ -x "$(command -v $DEPENDENCYTOCHECK)" ]; then
        echo "Error: ${DEPENDENCYTOCHECK} is not installed." >&2
        echo "Installing ${DEPENDENCYTOCHECK} ....."
        sudo apt-get install $DEPENDENCYTOCHECK -y
    fi
}

function installOpamIfNotFound {
    if ! [ -x "$(command -v opam)" ]; then
        echo "Error: opam is not installed." >&2
        echo 'Installing Opam...'
        wget https://github.com/ocaml/opam/releases/download/2.0.0/opam-2.0.0-x86_64-linux
        sudo mv opam-2.0.0-x86_64-linux /usr/local/bin/opam
        sudo chmod a+x /usr/local/bin/opam
        yes | opam init --compiler=4.06.1 --disable-sandboxing
        eval $(opam env)
    fi
}

function setUpTezosRepoandBuildTezosNode {
    findDependencyAndInstallIfNotFound git

    echo 'getting tezos repo...'
    git clone -b alphanet https://gitlab.com/tezos/tezos.git
    cd tezos/
    yes | make build-deps
    eval $(opam env)
    yes | make

    BUILD_FILE="./_build/default/src/bin_node/main.exe"
    if [ -f "$BUILD_FILE" ]; then
        touch ".$SETUP_SUCCESS_FILE"
        echo 'build is successful...'
    else 
        echo 'build is not successful, pleaese try again....'
    fi
    
}

function installDependencies {
    findDependencyAndInstallIfNotFound make
    findDependencyAndInstallIfNotFound unzip
    findDependencyAndInstallIfNotFound libev-dev
    findDependencyAndInstallIfNotFound libgmp-dev
    findDependencyAndInstallIfNotFound m4
    findDependencyAndInstallIfNotFound pkg-config
    findDependencyAndInstallIfNotFound libhidapi-dev
    findDependencyAndInstallIfNotFound build-essential
    findDependencyAndInstallIfNotFound nohup
    findDependencyAndInstallIfNotFound lsof
}

function cleanup {
    if [ -f "$SETUP_SUCCESS_FILE" ]; then
        rm $SETUP_SUCCESS_FILE
    fi

    if [ -f "$RUN_NODE_SUCCESS_FILE" ]; then
        rm $RUN_NODE_SUCCESS_FILE
    fi 

    if [ -d "$TEZOS_REPO_DIRECTORY" ]; then
        rm -rf $TEZOS_REPO_DIRECTORY
    fi
}

main
