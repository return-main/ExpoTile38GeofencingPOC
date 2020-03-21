FROM node
WORKDIR /usr/server
ENV DOCKER true
COPY package.json .
RUN npm install --quiet
COPY . .
