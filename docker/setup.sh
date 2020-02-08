#!/bin/bash
source /usr/local/bin/env.sh

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
        apt-get install $DEPENDENCYTOCHECK -y
    fi
}

function installOpamIfNotFound {
    if ! [ -x "$(command -v opam)" ]; then
        wget https://github.com/ocaml/opam/releases/download/2.0.0/opam-2.0.0-x86_64-linux
        mv opam-2.0.0-x86_64-linux /usr/local/bin/opam
        chmod a+x /usr/local/bin/opam
    fi

    yes | opam init --compiler=4.06.1 --disable-sandboxing
    eval $(opam env)

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

function setUpTezosRepoandBuildTezosNode {
    findDependencyAndInstallIfNotFound git

    echo 'getting tezos repo...'
    git clone -b babylonnet https://gitlab.com/tezos/tezos.git
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
    findDependencyAndInstallIfNotFound wget
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

/bin/bash