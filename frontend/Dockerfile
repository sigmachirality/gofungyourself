FROM node:17-alpine3.12

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --frozen-lockfile --no-dev

COPY . .

RUN "npm build"
CMD ["npm", "start"]