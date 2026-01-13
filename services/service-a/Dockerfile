FROM custom-node:22

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE ${PORT}

CMD ["node", "src/index.js"]
