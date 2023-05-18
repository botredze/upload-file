FROM node:14

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . /app

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "index.js"]
