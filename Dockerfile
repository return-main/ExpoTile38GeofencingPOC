FROM node
WORKDIR /usr/server
COPY package.json .
RUN npm install --quiet
COPY . .
