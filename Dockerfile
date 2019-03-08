FROM mhart/alpine-node:11
RUN mkdir -p /srv
WORKDIR /srv
COPY . /srv
ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN
RUN npm i -g typescript
RUN apk --update add --no-cache bash && \
  apk --update add --no-cache --virtual build-dependencies python git make g++ && \
  echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc && \
  npm ci --only=production && \
  apk del build-dependencies && \
  rm -Rf ~/.npm
EXPOSE 3333
CMD ["./scripts/start.sh"]
