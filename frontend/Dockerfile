FROM node:16.13.1-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --frozen-lockfile --no-dev

COPY . .

# RUN npm run build
CMD ["npm", "run", "build", "&&", "npm", "start"]