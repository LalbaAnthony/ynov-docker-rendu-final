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
| Service A | Backend    | `3001`       | `3001`       | Express | http://localhost:3001/api/a/ |
| Service B | Backend    | `3002`       | `3002`       | Express | http://localhost:3002/api/b/ |
| Service C | Frontend   | `80`         | `5173`       | Vue.js  | http://localhost/            |
| Service D | Monitoring | `19999`      | `19999`      | Netdata | http://localhost:19999/      |

Most externals and internals ports are the same to reduce confusion.

The frontend service is mapped to port `80` externally to be accessible without specifying a port in the URL because it is the main entry point for users.

### Images

| Name           | Base Image      | Description                                                                         | Why ?                                                                                                                    |
| -------------- | --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| custom-node:22 | debian:12-slim  | Reusable base for all Node.js image with common dependencies to reduce duplication. | Used debian since its lightweight.                                                                                       |
| service-a      | custom-node:22  | Backend service A                                                                   | Reusage of custom Node.js image to ensure consistency.                                                                   |
| service-b      | custom-node:22  | Backend service B                                                                   | Reusage of custom Node.js image to ensure consistency.                                                                   |
| service-c      | custom-node:22  | Frontend service C                                                                  | Reusage of custom Node.js image to ensure consistency.                                                                   |
| service-d      | netdata/netdata | Monitoring service with Netdata                                                     | Netdata is a lightweight monitoring tool that provides real-time insights into system performance and container metrics. |

### Custom Node.js image

A custom Node.js image is built on top of `debian:12-slim` to ensure all services have the same base environment and dependencies.

Its Dockerfile is located in `ressources/node-base/Dockerfile`.
This image installs common dependencies like `curl`, `git`, and `ca-certificates` that are often needed in Node.js applications.
It also sets up a non-root `nodeuser` user to enhance security.

### RAM and CPUs limitations

Limits: 
- Backend services are caped to `512Mo` of RAM and `0.2 CPU`.
- Frontend service is caped to `256Mo` of RAM and `0.1 CPU`. Since VueJS works in SPA, most of the load is on the client side.
- Monitoring service (Netdata) is caped to `256Mo` of RAM and `0.1 CPU` since it is lightweight.

Reservations:
They are all set to half of the limits to ensure that the services have enough resources to run properly.

### Healthchecks

An healthcheck is performed on both backend services.
The healthcheck's port is hardcoded since `PORT` is not available at build time.
Docker healthchecks are static by design.
Environment substitution does not happen here.

## ⚡ Services

### Service A

This service is a backend API built with Express.js.

It serves as a simple example of a microservice architecture.

It serves 2 endpoints:
- `GET /`: Returns a simple welcome message.
- `GET /health`: Returns a simple response to indicate the service is healthy.

All others routes return a `404 Not Found` response.

### Service B

This service is a backend API built with Express.js.

It serves as a simple example of a microservice architecture.

It serves 2 endpoints:
- `GET /`: Returns a simple welcome message.
- `GET /health`: Returns a simple response to indicate the service is healthy.

All others routes return a `404 Not Found` response.

### Service C

This service is a frontend application built with Vue.js.

It serves as the main entry point for users.
It fetches data from Service A and Service B and displays it to the user.

It serves 1 page:
- `GET /`: Fetches data from Service A and Service B and displays it.

### Service D

This service is responsible for monitoring the other services in real-time using Netdata.

In docker compose, a netdata service is added to monitor all containers in real-time.

All `container_name` are set to have more readable names in netdata dashboard.
The Netdata configuration is registered in `services/service-d/netdata.conf`. It used on the custom netdata image build in `services/service-d/Dockerfile`.

#### Setup

If you want to monitor your containers with netdata, you can follow these steps:
- Make sure you have `docker-compose.yml` configured with netdata service.
- Start your services using Docker Compose: `docker compose up -d`.
- Goto `http://localhost:19999` in your web browser to access the Netdata dashboard.
- Follow the on-screen instructions to complete the setup.