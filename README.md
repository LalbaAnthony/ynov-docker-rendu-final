## 🚀 Quick start

All `.env.example` files contain real working example values, so you can use them as-is for local development. In a production environment, we would recommend changing sensitive values such as API keys, passwords, and secrets.

```sh
# FOR EACH SERVICE `service-*` LIKE SERVICE: Copy the example environment file
cd services/<SERVICE_NAME>
cp .env.example .env

# First, build the custom Node.js 22 Docker image
docker build -t custom-node:22 ./docker/node-base # output: a usable Node.js 22 named custom-node:22

# Then, start all services with Docker Compose
docker compose build --no-cache ; docker compose up

# Rebuild one service if needed
docker compose down
docker compose build --no-cache service-a
docker compose up
```

## 🛠️ Architecture

### Ports binding

| Name            | Type        | Port   | Techno     | Internal URL          | URL                          |
| --------------- | ----------- | ------ | ---------- | --------------------- | ---------------------------- | 
| Service A       | Backend     | 3001   | Express    | http://localhost:3001 | http://localhost:8080/api/a/ |
| Service B       | Backend     | 3002   | Express    | http://localhost:3002 | http://localhost:8080/api/b/ |
| Service C       | Frontend    | 5173   | Vue.js     | http://localhost:5173 | //                           |

### RAM and CPUs limitations

Backend services are caped to `1Go` of RAM and `1 CPU`.
Frontend service is caped to `512Mo` of RAM and `0.5 CPU`. Since VueJS wors in SPA, most of the load is on the client side.

### Healthchecks

An healthcheck is performed on both backend services.
The healthcheck's port is hardcoded since `PORT` is not available at build time.
Docker healthchecks are static by design.
Environment substitution does not happen here.