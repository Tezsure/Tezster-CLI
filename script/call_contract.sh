#!/bin/bash
source ./env.sh

function main {
    ./tezos/tezos-client -A 0.0.0.0 -P 18731 --base-dir ./tmp/ transfer 0 from bootstrap1 to $1 --arg "$2" --burn-cap 10

}

main "$@"