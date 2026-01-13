FROM custom-node:22

WORKDIR /app

COPY --chown=nodeuser:nodeuser package*.json ./
RUN npm ci

COPY --chown=nodeuser:nodeuser . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
