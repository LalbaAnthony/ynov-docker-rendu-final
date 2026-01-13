## 🚀 Quick start

All `.env.example` files contain real working example values, so you can use them as-is for local development. In a production environment, we would recommend changing sensitive values such as API keys, passwords, and secrets.

```sh
# FOR EACH SERVICE `service-*` LIKE SERVICE: Copy the example environment file
cd services/<SERVICE_NAME>
cp .env.example .env

# First, build the custom Node.js 22 Docker image
docker build -t custom-node:22 ./docker/node-base # output: a usable Node.js 22 named custom-node:22

# Then, start all services with Docker Compose
docker compose build --no-cache
docker compose up
```

## 🛠️ Architecture

### Ports binding

| Service         | Port | Description      | URL                   |
| --------------- | ---- | ---------------- | --------------------- |
| Service A       | 3001 | Express backend  | http://localhost:3001 |
| Service B       | 3002 | Express backend  | http://localhost:3002 |
| Service C       | 5173 | Vue.js frontend  | http://localhost:5173 |
