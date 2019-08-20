#!/bin/bash
function stopnode {
    PORT=$1
	PID=$(lsof -ti:$PORT)

	if ! [[ "$PID" =~ ^[0-9]+$ ]] ; then
		echo "no running node found on $PORT"
	else 
		echo "killing the node running on $PORT"
		kill -9 $PID
		fi    
}

function main {
	stopnode 18731
	stopnode 18732
	rm -rf ./tmp/blocks
	rm -rf ./tmp/nonces
	rm -rf ./tmp/wallet_lock
	rm -rf ./tmp/contracts
	rm -rf ./baking-tx.log
}

main
