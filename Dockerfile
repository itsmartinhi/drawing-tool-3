FROM node:18-alpine

COPY ./public public
COPY ./package-lock.json .
COPY ./package.json .
COPY ./tsconfig.json .
COPY ./server.js .

RUN npm i
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
