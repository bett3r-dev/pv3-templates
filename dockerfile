FROM node:alpine

WORKDIR /app

# Services

COPY config/default.yaml ./config/default.yaml

RUN npm i --omit=dev

CMD ["node", "index.js"]
