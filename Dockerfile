FROM ubuntu:14.04

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y git git-core wget zip nodejs npm

EXPOSE 8080

# startup
ADD start.sh /tmp/
RUN chmod +x /tmp/start.sh
CMD ./tmp/start.sh