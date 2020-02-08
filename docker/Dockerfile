FROM ubuntu:16.04

EXPOSE 18731 18732

RUN apt-get update
RUN apt-get install -y nodejs npm sudo

ADD start_nodes.sh /usr/local/bin/start_nodes.sh
RUN chmod +x /usr/local/bin/start_nodes.sh

ADD env.sh /usr/local/bin/env.sh
RUN chmod +x /usr/local/bin/env.sh

ADD setup.sh /usr/local/bin/setup.sh
RUN chmod +x /usr/local/bin/setup.sh
CMD /usr/local/bin/setup.sh