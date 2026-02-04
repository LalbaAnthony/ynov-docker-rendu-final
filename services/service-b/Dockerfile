FROM custom-node:22

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=15s \
    CMD node -e "require('http').get({host:'127.0.0.1', port: process.env.PORT, path:'/health', timeout:2000}, r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

STOPSIGNAL SIGTERM

EXPOSE ${PORT}

ENTRYPOINT ["node", "src/index.js"]
