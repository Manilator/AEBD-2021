FROM node:12-buster-slim

RUN apt-get update && apt-get install -y libaio1 wget unzip

WORKDIR /opt/oracle

RUN wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip && \
    unzip instantclient-basiclite-linuxx64.zip && rm -f instantclient-basiclite-linuxx64.zip && \
    cd /opt/oracle/instantclient* && rm -f *jdbc* *occi* *mysql* *mql1* *ipc1* *jar uidrvci genezi adrci && \
    echo /opt/oracle/instantclient* > /etc/ld.so.conf.d/oracle-instantclient.conf && ldconfig

WORKDIR /restapi
COPY package.json /restapi/
COPY server.js /restapi/
COPY dbConfig.js /restapi/
RUN npm install oracledb && \
    npm install express && \
    npm install body-parser

CMD exec node server.js