FROM node:12

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 4000

CMD ["npm", "run", "serve"]