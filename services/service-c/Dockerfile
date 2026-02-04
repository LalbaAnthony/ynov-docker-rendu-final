FROM custom-node:22

WORKDIR /app

COPY --chown=nodeuser:nodeuser package*.json ./
RUN npm install

COPY --chown=nodeuser:nodeuser . .

EXPOSE 5173

ENTRYPOINT ["npm", "run", "dev", "--", "--host"]
