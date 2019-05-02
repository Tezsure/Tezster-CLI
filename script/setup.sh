sudo apt-get -y update 
sudo apt-get -y upgrade
echo 'Installing Opam...'
wget https://github.com/ocaml/opam/releases/download/2.0.0/opam-2.0.0-x86_64-linux
sudo mv opam-2.0.0-x86_64-linux /usr/local/bin/opam
sudo chmod a+x /usr/local/bin/opam
opam init --compiler=4.06.1 --disable-sandboxing
eval $(opam env)

echo 'getting tezos node...'
git clone -b alphanet https://gitlab.com/tezos/tezos.git
cd tezos/
sudo apt-get install libev-dev
sudo apt-get install libgmp-dev
sudo apt-get install m4
sudo apt-get install pkg-config
sudo apt-get install libhidapi-dev

make build-deps
eval $(opam env)
make