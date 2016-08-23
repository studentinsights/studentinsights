FROM node:6.4.0

# phantomjs, for casperjs
RUN wget -qO- https://studentinsights-public.s3.amazonaws.com/phantomjs-2.1.1-linux-x86_64.tar.bz2 | tar xvj && \
  mkdir -p /root/.phantomjs/2.1.1/x86_64-linux/bin/ && \
  mv phantomjs-2.1.1-linux-x86_64/bin/phantomjs /root/.phantomjs/2.1.1/x86_64-linux/bin && \
  rm -rf phantomjs-2.1.1-linux-x86_64/
ENV PATH $PATH:/root/.phantomjs/2.1.1/x86_64-linux/bin

RUN npm install