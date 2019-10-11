FROM node:12-alpine

COPY package*.json ./

RUN npm install
