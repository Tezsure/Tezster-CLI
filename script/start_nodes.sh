nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 1 >> node-1.log 2>&1 &
nohup ./tezos/src/bin_node/tezos-sandboxed-node.sh 2 >> node-2.log 2>&1 &
disown
