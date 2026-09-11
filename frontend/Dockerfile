FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci || (cat /root/.npm/_logs/* && exit 1)

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]