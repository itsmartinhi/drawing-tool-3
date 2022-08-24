FROM node:18-alpine

COPY ./frontend frontend
COPY ./src src
COPY ./package-lock.json .
COPY ./package.json .
COPY ./tsconfig.json .

RUN npm install
RUN npm run build

EXPOSE 3000
EXPOSE 3001

CMD [ "npm", "run", "start" ]
