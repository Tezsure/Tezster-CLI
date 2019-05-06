




function main {
    sudo apt-get -y update 
    sudo apt-get -y upgrade
    installOpamIfNotFound
    installDependencies
    setUpTezosRepoandBuildTezosNode
}

function findDependencyAndInstallIfNotFound {
    DEPENDENCYTOCHECK=$1
    echo "checking if $DEPENDENCYTOCHECK is installed or not...."
    if ! [ -x "$(command -v $DEPENDENCYTOCHECK)" ]; then
        echo "Error: ${DEPENDENCYTOCHECK} is not installed." >&2
        echo "Installing ${DEPENDENCYTOCHECK} ....."
        sudo apt-get install $DEPENDENCYTOCHECK -y
    fi
}

function installOpamIfNotFound {
    if ! [ -x "$(command -v opam)" ]; then
        echo "Error: opam is not installed." >&2
        echo 'Installing Opam...'
        wget https://github.com/ocaml/opam/releases/download/2.0.0/opam-2.0.0-x86_64-linux
        sudo mv opam-2.0.0-x86_64-linux /usr/local/bin/opam
        sudo chmod a+x /usr/local/bin/opam
        opam init --compiler=4.06.1 --disable-sandboxing
        eval $(opam env)
    fi
}

function setUpTezosRepoandBuildTezosNode {
    findDependencyAndInstallIfNotFound git
    DIRECTORY="./tezos"
    if [ -d "$DIRECTORY" ]; then
        rm -rf ./tezos
    fi

    echo 'getting tezos repo...'
    git clone -b alphanet https://gitlab.com/tezos/tezos.git
    cd tezos/
    yes | make build-deps
    eval $(opam env)
    yes | make
    echo 'build is successful...'
}

function installDependencies {
    findDependencyAndInstallIfNotFound libev-dev
    findDependencyAndInstallIfNotFound libgmp-dev
    findDependencyAndInstallIfNotFound m4
    findDependencyAndInstallIfNotFound pkg-config
    findDependencyAndInstallIfNotFound libhidapi-dev
}

main