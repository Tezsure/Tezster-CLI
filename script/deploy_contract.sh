#!/bin/bash
source ./env.sh

function main {
    ./tezos/tezos-client -l -A 0.0.0.0 -P 18731 -base-dir ./tmp originate contract $1 for bootstrap1 transferring 10 from bootstrap1 running "$2" --init "$3" --burn-cap 10
}

main "$@"