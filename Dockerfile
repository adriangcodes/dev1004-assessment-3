FROM node:alpine

COPY package*.json README.md seed.js db.js auth.js ./

COPY docs/LICENSE.md ./docs/

COPY models ./models/

COPY routes ./routes/

RUN npm install

CMD ["npm", "run", "dev"]

EXPOSE 8080