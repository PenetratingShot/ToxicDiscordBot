FROM node:latest
RUN mkdir /usr/src/bot
WORKDIR /usr/src/bot
COPY package.json /usr/src/bot
RUN npm install
COPY . /usr/src/bot
CMD ["node", "server.js"]