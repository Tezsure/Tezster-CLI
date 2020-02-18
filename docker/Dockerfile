FROM ubuntu:16.04

EXPOSE 18731

RUN apt-get update
RUN apt-get install -y nodejs npm sudo

ADD start_nodes.sh /usr/local/bin/start_nodes.sh
RUN chmod +x /usr/local/bin/start_nodes.sh

ADD env.sh /usr/local/bin/env.sh
RUN chmod +x /usr/local/bin/env.sh

ADD tmp /usr/local/bin/tmp
RUN chmod +x /usr/local/bin/tmp

ADD setup.sh /usr/local/bin/setup.sh
RUN chmod +x /usr/local/bin/setup.sh
RUN cd /usr/local/bin && ./setup.sh