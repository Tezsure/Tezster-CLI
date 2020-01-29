FROM ubuntu:latest
FROM node:latest

EXPOSE 18731 

ADD shell.sh /usr/local/bin/shell.sh
RUN chmod +x /usr/local/bin/shell.sh
CMD /usr/local/bin/shell.sh
