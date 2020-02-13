#!/bin/bash
source usr/local/bin/env.sh

function main {
    cd /tezos && tezos-client -l -base-dir ./tmp -addr localhost -port 18731  bake for $1 >> $BAKING_LOGS
}

main "$@"