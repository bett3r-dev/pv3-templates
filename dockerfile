FROM node:alpine

WORKDIR /app

# Services

COPY build/domainEvents ./domainEvents
COPY build/libraries ./libraries
COPY config/default.yaml ./config/default.yaml
RUN npm pkg set scripts.postinstall="link-module-alias"

RUN npm i --omit=dev

CMD ["node", "index.js"]
