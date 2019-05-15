#!/bin/bash
source ./env.sh

# TODO : 
    #    - Kill any process running on port 18731 & 18732 before starting the node
    #    - Verify that nodes are successfully running y checking processes on port 18731 & 18732

function main {
    
    if [ -f "$SETUP_SUCCESS_FILE" ]; then
        nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 1 > $NODE_18731_LOG 2>&1 &
        nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 2 > $NODE_18732_LOG 2>&1 &
        touch $RUN_NODE_SUCCESS_FILE &
        disown
    else 
        echo 'setup is not successful, please try running it again....'
    fi
}

main
