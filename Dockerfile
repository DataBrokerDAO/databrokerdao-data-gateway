FROM node:9-alpine

RUN apk --update add --no-cache openssh-client git make gcc g++ python rsync bash
RUN git config --global user.email "hello@settlemint.io"
RUN git config --global user.name "SettleMint"

# Secure NPM token in Docker building
# See https://docs.npmjs.com/private-modules/docker-and-private-modules
ARG NPM_TOKEN
COPY .npmrc .npmrc

RUN npm i -g node-gyp

RUN mkdir -p /srv
WORKDIR /srv
COPY . /srv
RUN npm i

# Remove the npmrc again
# WARNING: in the CI you __MUST__ squash Docker commits with docker build --squash,
# or the npmrc file can be extracted from an underlying layer.
RUN rm -f .npmrc

EXPOSE 3333

CMD ["./run.sh"]