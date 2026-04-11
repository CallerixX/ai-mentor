FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

RUN npx tailwindcss init -p

EXPOSE 3000

CMD ["npm", "run", "dev"]
