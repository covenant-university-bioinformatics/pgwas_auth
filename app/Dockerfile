FROM node:14.16.1-alpine3.12

ENV CI=true
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./

COPY yarn.lock ./

RUN npm install -g @nestjs/cli

RUN yarn install

COPY ./ ./

RUN yarn run build

CMD [ "yarn", "run", "start" ]