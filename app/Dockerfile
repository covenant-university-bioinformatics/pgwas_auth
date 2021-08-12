FROM node:14.16.1-alpine3.12

ENV CI=true


WORKDIR /app

COPY package.json ./

RUN npm install -g @nestjs/cli

RUN npm install

COPY ./ ./

RUN npm run build

#ENV NODE_ENV=production

CMD [ "npm", "run", "start:prod" ]