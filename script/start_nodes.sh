#!/bin/bash
source ./env.sh

# TODO : 
    #    - Kill any process running on port 18731 & 18732 before starting the node
    #    - Verify that nodes are successfully running by checking processes on port 18731 & 18732

function main {
    
    if [ -f "$SETUP_SUCCESS_FILE" ]; then
        nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 1 > $NODE_18731_LOG 2>&1 &
        nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 2 > $NODE_18732_LOG 2>&1 &
        touch $RUN_NODE_SUCCESS_FILE 
        echo "Started nodes successfully..."
        sleep 15
        activateAlpha > $ACTIVATE_ALPHA_LOG 2>&1 
        echo "Activated alpha protocol successfully..."
    else 
        echo 'setup is not successful, please try running "tezster setup" again....'
    fi
}

function activateAlpha() {
    ./tezos/src/bin_client/tezos-init-sandboxed-client.sh 1
    ./tezos/tezos-client -base-dir /tmp/tezos-tmp-client.8ScVVzls -addr localhost -port 18731  -block genesis activate protocol PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP with fitness 1 and key activator and parameters ./tezos/scripts/protocol_parameters.json --timestamp $(TZ='AAA+1' date +%FT%TZ)
}

main
