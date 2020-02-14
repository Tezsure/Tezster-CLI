#!/bin/bash

function main {
    cd ../docker
    sudo docker-compose up -d
    if [ $? -eq 0 ]; then
        echo 'Started nodes successfully...'
    else 
        echo 'setup is not successful, please try running "tezster setup" again....'
    fi
}

main