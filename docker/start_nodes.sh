#!/bin/bash
source ./env.sh

# TODO : 
    #    - Kill any process running on port 18731 & 18732 before starting the node
    #    - Verify that nodes are successfully running by checking processes on port 18731 & 18732

function main {
    cleanup
    if [ -f "$SETUP_SUCCESS_FILE" ]; then
        mkdir $BAKER_DATA_DIR
        DATA_DIR=$BAKER_DATA_DIR nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 1 > $NODE_18731_LOG 2>&1 &
        nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 2 > $NODE_18732_LOG 2>&1 &
        nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 3 > $NODE_18733_LOG 2>&1 &
        sleep 15
        PID18731=$(lsof -ti:18731)
        PID18732=$(lsof -ti:18732)
        PID18733=$(lsof -ti:18733)
        if [[ "$PID18731" =~ ^[0-9]+$ && "$PID18732" =~ ^[0-9]+$ && "$PID18733" =~ ^[0-9]+$ ]] ; then
            touch $RUN_NODE_SUCCESS_FILE 
            echo "Started nodes successfully..."
        else 
            echo "Failed starting the nodes, please try again after killing any process running at port 18731 & 18732"
            exit 0
		fi 
        activateAlpha > $ACTIVATE_ALPHA_LOG 2>&1 
        echo "Activated alpha protocol successfully..."
    else 
        echo 'setup is not successful, please try running "tezster setup" again....'
    fi
}

function activateAlpha() {
    ./tezos/src/bin_client/tezos-init-sandboxed-client.sh 1
    ./tezos/tezos-client -l -base-dir ./tmp -addr localhost -port 18731  -block genesis activate protocol PsBabyM1eUXZseaJdmXFApDSBqj8YBfwELoxZHHW77EMcAbbwAS with fitness 1 and key activator and parameters ./tezos/sandbox-parameters.json --timestamp $(TZ='AAA+1' date +%FT%TZ)
    sleep 15
    ./tezos/tezos-client -l -base-dir ./tmp -addr localhost -port 18731 register key bootstrap1 as delegate
    nohup ./tezos/tezos-baker-005-PsBabyM1 -l -base-dir ./tmp -addr localhost -port 18731 -P --pid.txt run with local node $BAKER_DATA_DIR bootstrap1 > $BAKING_LOGS 2>&1 &
}

function cleanup() {
    rm -rf ./tmp/blocks
	rm -rf ./tmp/nonces
	rm -rf ./tmp/wallet_lock
    rm -rf $NODE_18731_LOG
	rm -rf $NODE_18732_LOG
	rm -rf $NODE_18733_LOG
	rm -rf $BAKING_LOGS
	rm -rf $RUN_NODE_SUCCESS_FILE
    rm -rf $BAKER_DATA_DIR
    rm -rf $ACTIVATE_ALPHA_LOG
}

main
