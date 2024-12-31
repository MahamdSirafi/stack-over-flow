FROM node:20 as base

FROM base as development
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm","run","build"]
CMD ["npm","start"]

FROM base as production
WORKDIR /app
COPY package.json /app
RUN npm install --only=production
COPY . .
EXPOSE 3000
CMD ["npm","run","watch"]
CMD ["npm","run","start:prod"]

