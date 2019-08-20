#!/bin/bash
source ./env.sh

function main {
    ./tezos/tezos-client -l -base-dir ./tmp -addr localhost -port 18731  bake for $1 >> $BAKING_LOGS
}

main "$@"