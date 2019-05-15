#!/bin/bash

main {
    ./setup.sh
    ./start_node.sh
    source start_network.sh
}

main