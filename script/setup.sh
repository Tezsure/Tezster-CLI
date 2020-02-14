#!/bin/bash

function main {
    checkDependencies
    pullDockerImage
}

function findDependency {
    DEPENDENCYTOCHECK=$1
    echo "checking if $DEPENDENCYTOCHECK is installed or not...."
    if ! [ -x "$(command -v $DEPENDENCYTOCHECK)" ]; then
        echo "Error: ${DEPENDENCYTOCHECK} is not installed. Make sure that you have ${DEPENDENCYTOCHECK} installed on your system" >&2
    fi
}

function pullDockerImage {
    sudo docker pull kapil1221/tezster-cli
}

function checkDependencies {
    findDependency docker
}

main
