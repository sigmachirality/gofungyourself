FROM node:17-alpine3.12

COPY package.json packge-lock.json ./

RUN npm install --frozen-lockfile --no-dev

COPY . .

CMD ["npm", "start"]