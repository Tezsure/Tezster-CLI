#!/bin/bash

#TODO : 
#   - Make sure nodes are running successfully

eval `./tezos/src/bin_client/tezos-init-sandboxed-client.sh 1`
tezos-activate-alpha
echo "Tezos chain has been deployed successfully."
