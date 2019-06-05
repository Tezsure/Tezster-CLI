#!/bin/bash
source ./env.sh

function main {
    opam switch create liquidity 4.06.1
    eval `opam env --switch liquidity`
    git clone https://github.com/OCamlPro/liquidity
    cd liquidity
    make clone-tezos
    make build-deps
    make
    make install    
}

main
