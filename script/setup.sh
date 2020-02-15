#!/bin/bash

function main {
    cleanup
    checkDependencies
    pullDockerImage
}

function findDependency {
    DEPENDENCYTOCHECK=$1
    echo "checking if $DEPENDENCYTOCHECK is installed or not...."
    if ! [ -x "$(command -v $DEPENDENCYTOCHECK)" ]; then
        echo "Error: ${DEPENDENCYTOCHECK} is not installed. Make sure that you have ${DEPENDENCYTOCHECK} installed on your system" >&2
    else 
    echo "wait for while, pulling docker image... "
    fi
}

function pullDockerImage {
    sudo docker pull kapil1221/tezster-cli
}

function checkDependencies {
    findDependency docker
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
