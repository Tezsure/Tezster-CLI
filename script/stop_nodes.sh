#!/bin/bash
source ./env.sh

function stopnode {
    PORT=$1
	PIDS=$(lsof -ti:$PORT)

	for PID in $PIDS
		do 
			if ! [[ "$PID" =~ ^[0-9]+$ ]] ; then
				echo "no running node found on $PORT"
			else 
				echo "killing the node running on $PORT pid: $PID"
				kill -9 $PID
			fi
		done    
}

function main {
	stopnode 18731
	stopnode 18732
	stopnode 18733
	rm -rf ./tmp/blocks
	rm -rf ./tmp/nonces
	rm -rf ./tmp/wallet_lock
	rm -rf ./tmp/contracts
}

main
