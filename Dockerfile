FROM ubuntu:16.04

EXPOSE 18731 18732

RUN apt-get update
RUN apt-get install -y nodejs npm sudo
# RUN npm install -g tezster@latest
# RUN tezster setup

RUN apt-get install -y git make unzip libev-dev libgmp-dev m4 pkg-config libhidapi-dev build-essential lsof wget

RUN wget http://security.ubuntu.com/ubuntu/pool/universe/b/bubblewrap/bubblewrap_0.2.1-1_amd64.deb
RUN dpkg -i ./bubblewrap_0.2.1-1_amd64.deb
RUN apt-get install bubblewrap

RUN git clone https://gitlab.com/tezos/tezos.git
RUN cd tezos && git checkout babylonnet

RUN wget https://github.com/ocaml/opam/releases/download/2.0.0/opam-2.0.0-x86_64-linux
RUN cp opam-2.0.0-x86_64-linux /usr/local/bin/opam
RUN chmod a+x /usr/local/bin/opam
RUN opam init --compiler=4.06.1 --disable-sandboxing
RUN opam switch 4.06.1
RUN opam update
RUN eval $(opam env) && cd tezos && make build-deps && eval $(opam env) && make

# RUN ./tezos-node identity generate

# RUN export PATH =~/tezos:$PATH
# RUN source ./src/bin_client/bash-completion.sh
# RUN export TEZOS_CLIENT_UNSAFE_DISABLE_DICLAIMER=Y

ADD shell.sh /usr/local/bin/shell.sh
RUN chmod +x /usr/local/bin/shell.sh
CMD /usr/local/bin/shell.sh