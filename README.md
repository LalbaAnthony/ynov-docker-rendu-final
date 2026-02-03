## 🚀 Quick start

All `.env.example` files contain real working example values, so you can use them as-is for local development. In a production environment, we would recommend changing sensitive values such as API keys, passwords, and secrets.

```sh
# FOR EACH SERVICE `service-*` LIKE SERVICE: Copy the example environment file
cd services/<SERVICE_NAME>
cp .env.example .env

# First, build the custom Node.js 22 Docker image
docker build -t custom-node:22 ./ressources/node-base # output: a usable Node.js 22 named custom-node:22

# Then, start all services with Docker Compose
docker compose build --no-cache ; docker compose up

# Restart all services without rebuilding images
docker compose down ; docker compose up

# Rebuild one service if needed
docker compose down
docker compose build --no-cache service-a
docker compose up
```

## 🛠️ Architecture

### Repo structure

```sh
.
├── docker-compose.yml # Main Docker Compose file
├── README.md          # This documentation file
├── ressources         # Custom images and configurations that arn't buisness logic related
│   └── node-base
│       └── Dockerfile
└── services           # All microservices
    ├── service-a
    │   ├── Dockerfile
    │   ├── .env.example
    │   └── src
    │       └── ...
    └── ...
```

### Ports binding

| Name      | Type       | Port externe | Port interne | Techno  | URL                          |
| --------- | ---------- | ------------ | ------------ | ------- | ---------------------------- |
| Service A | Backend    | 3001         | 3001         | Express | http://localhost:3001/api/a/ |
| Service B | Backend    | 3002         | 3002         | Express | http://localhost:3002/api/b/ |
| Service C | Frontend   | 80           | 5173         | Vue.js  | http://localhost/            |
| Service D | Monitoring | 19999        | 19999        | Netdata | http://localhost:19999/      |

### RAM and CPUs limitations

Backend services are caped to `1Go` of RAM and `1 CPU`.

Frontend service is caped to `512Mo` of RAM and `0.5 CPU`. Since VueJS works in SPA, most of the load is on the client side.

### Healthchecks

An healthcheck is performed on both backend services.
The healthcheck's port is hardcoded since `PORT` is not available at build time.
Docker healthchecks are static by design.
Environment substitution does not happen here.

## Netdata

In docker compose, a netdata service is added to monitor all containers in real-time.

All `container_name` are set to have more readable names in netdata dashboard.
The Netdata configuration is registered in `ressources\netdata\netdata.conf`. It used on the custom netdata image build in `ressources\netdata\Dockerfile`.

### Setup

If you want to monitor your containers with netdata, you can follow these steps:
- Make sure you have `docker-compose.yml` configured with netdata service.
- Start your services using Docker Compose: `docker compose up -d`.
- Goto `http://localhost:19999` in your web browser to access the Netdata dashboard.
- Follow the on-screen instructions to complete the setup.