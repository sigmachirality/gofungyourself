FROM node:17-alpine3.12

RUN ls

COPY package.json packge-lock.json ./

RUN npm install --frozen-lockfile --no-dev

COPY . .

CMD ["npm", "start"]