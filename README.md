## 🚀 Quick start

All `.env.example` files contain real working example values, so you can use them as-is for local development. In a production environment, we would recommend changing sensitive values such as API keys, passwords, and secrets.

```sh
# ! FOR EACH SERVICE LIKE `service-*`: Copy the example environment file is needed
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
docker compose build --no-cache service-c
docker compose up
```

## 📋 Others commands

"Nuke" command to stop and remove all containers, images, volumes, and build cache:
```powershell
docker stop $(docker ps -aq) 2>$null; docker system prune -a --volumes -f; docker builder prune -a -f
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

| Name      | Type       | Port externe | Port interne | Techno  | URL                                       |
| --------- | ---------- | ------------ | ------------ | ------- | ----------------------------------------- |
| Service A | Backend    | /            | `3001`       | Express | http://localhost/api/a/                   |
| Service B | Backend    | /            | `3002`       | Express | http://localhost/api/b/                   |
| Service C | Frontend   | /            | `5173`       | Vue.js  | http://localhost/                         |
| Service D | Monitoring | /            | `19999`      | Netdata | http://localhost/netdata                  |
| Service E | Reverse PX | `80`, `8080` | `80`         | Traefik | http://localhost/, http://localhost:8080/ |

Most externals and internals ports are the same to reduce confusion.

The frontend service is mapped to port `80` externally to be accessible without specifying a port in the URL because it is the main entry point for users.

### Images

| Name           | Base Image      | Description                                                                         | Why ?                                                                                                                          |
| -------------- | --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| custom-node:22 | debian:12-slim  | Reusable base for all Node.js image with common dependencies to reduce duplication. | Used debian since its lightweight. I prefer debian over alpine for better compatibility with native modules.                   |
| service-a      | custom-node:22  | Backend service A                                                                   | Reusage of custom Node.js image to ensure consistency.                                                                         |
| service-b      | custom-node:22  | Backend service B                                                                   | Reusage of custom Node.js image to ensure consistency.                                                                         |
| service-c      | custom-node:22  | Frontend service C                                                                  | Reusage of custom Node.js image to ensure consistency.                                                                         |
| service-d      | netdata/netdata | Monitoring service with Netdata                                                     | Netdata is a lightweight monitoring tool that provides real-time insights into system performance and container metrics.       |
| service-e      | traefik:v3.0    | Reverse proxy service with Traefik                                                  | Traefik is a modern reverse proxy and load balancer that integrates well with Docker and provides automatic service discovery. |

### Custom Node.js image

A custom Node.js image is built on top of `debian:12-slim` to ensure all services have the same base environment and dependencies.

Its Dockerfile is located in `ressources/node-base/Dockerfile`.
This image installs common dependencies like `curl`, `git`, and `ca-certificates` that are often needed in Node.js applications.
It also sets up a non-root `nodeuser` user to enhance security.

### RAM and CPUs limitations

Those limitations aims to maintain a small CPU usage arround 1 CPU core.
On a production server, we would adapt those values based on the server capacity and expected load.

| Service   | RAM (Limite) | CPU (Limite) | RAM (Réservation) | CPU (Réservation) | Reasoning                                                                                                  |
| --------- | ------------ | ------------ | ----------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| service-a | 128Mo        | 0.2          | 64Mo              | 0.2               | Node.js backend services are generally lightweight and do not require a lot of resources (30-50 Mo empty). |
| service-b | 128Mo        | 0.2          | 64Mo              | 0.2               | Node.js backend services are generally lightweight and do not require a lot of resources (30-50 Mo empty). |
| service-c | 256M         | 0.2          | 128Mo             | 0.1               | Vue.js frontend service is mostly static files, so it has a very low resource usage.                       |
| service-d | 256Mo        | 0.3          | 128Mo             | 0.2               | Netdata is lightweight but can use more resources when monitoring multiple containers.                     |
| service-e | 64Mo         | 0.2          | 32Mo              | 0.1               | Traefik is efficient and does not require many resources for basic reverse proxying.                       |

Limits are set based on typical usage patterns for Node.js applications and the specific needs of each service.
In practice, Node.js applications often use around `30-50 Mo` of RAM when idle, so the limits are set to provide enough headroom for normal operation while preventing excessive resource consumption.

Reservations are typicaly set to half of the limits to ensure that the services have enough resources to run properly.

Here is a sample output of `docker stats` showing the resource usage of each service:
```
CONTAINER ID   NAME        CPU %     MEM USAGE / LIMIT   MEM %     NET I/O           BLOCK I/O   PIDS
13f852fdd68a   service-a   0.00%     30.85MiB / 128MiB   24.10%    1.39kB / 0B       0B / 0B     7
8115ce551bec   service-b   0.00%     32.52MiB / 128MiB   25.40%    1.39kB / 0B       0B / 0B     7
025e03efc339   service-c   0.11%     97.49MiB / 256MiB   38.08%    746B / 0B         0B / 0B     43
158e7593b631   service-d   1.57%     91.78MiB / 256MiB   35.85%    7.98kB / 6.18kB   0B / 0B     102
ebfb8086f77a   service-e   0.00%     44.7MiB / 64MiB     69.85%    1.39kB / 0B       0B / 0B     21
```

### Healthchecks, restarts and lifecycle management

#### Healthchecks

An healthcheck is performed on both backend services.

On the very first version, we used to do:
```dockerfile
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1
```

But the port was hardcoded since `PORT` is not available at build time, making it unusable for other services, and kinda ugly.
I upgraded it to use a Node.js one-liner l reads the `PORT` environment variable:
```dockerfile
HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=15s \
    CMD node -e "require('http').get({host:'127.0.0.1', port: process.env.PORT, path:'/health', timeout:2000}, r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
```

#### SIGNAL forwarding

Both backend have a proper `SIGTERM` and `SIGINT` handling to gracefully shutdown when Docker sends the signal during a `docker stop` or `docker compose down` as

```javascript
// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down...`)

    server.close(() => {
        console.log('Server closed')
        process.exit(0)
    })

    setTimeout(() => process.exit(1), 10000)
}

// We handle more signals than juste the docker `STOPSIGNAL SIGTERM`, just in case this code is run outside docker
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
```

This ensures that the application can clean up resources and finish ongoing requests before exiting.

On both backend services, the service will log the received signal and shut down gracefully within `10 seconds`.

`STOPSIGNAL` is explicitly set to `SIGTERM` in the Dockerfile to ensure consistency.

#### Restart policies for backend services

Here is a table summarizing different failure scenarios, their observed results, and the mechanisms that enable these behaviors:

| Issue / Event                      | Solution                                                             | Mechanism                        | Related Snippet                    |
| ---------------------------------- | -------------------------------------------------------------------- | -------------------------------- | ---------------------------------- |
| RAM Limit Exceeded                 | Process killed (OOM) => Restart                                      | `deploy.resources.limits.memory` | `process.memoryUsage().rss`        |
| Application Freeze                 | Container marked `unhealthy`                                         | Docker HEALTHCHECK               | `HEALTHCHECK CMD node -e \"...\"`  |
| Memery usage above the `128` limit | An internal whatchdog will make the app exit, container will restart | setInterval whatchdog            | `setInterval(() => { ... }, 5000)` |
| Application Crash                  | Container restarts automatically                                     | `restart: unless-stopped`        | `throw new Error('boom')`          |
| Dependency unavailable at boot     | Wait before healthcheck + retry                                      | `start_period`                   | `--start-period=15s`               |
| CPU Throttling                     | Slow performance, no crash                                           | Docker CPU limit                 | `cpus: '0.1'`                      |
| Docker stop                        | Graceful shutdown                                                    | SIGTERM handling                 | `process.on('SIGTERM', shutdown)`  |
| Docker compose down                | No restart                                                           | Manual/Intentional stop          | `docker compose down`              |

#### Restart policies for frontend

No healthcheck is implemented since Vue.js frontend.
This is ententionnal since the frontend is mostly static files served to the client.

The restart policy is set to `unless-stopped` to ensure the service restarts automatically in case of crashes, but not when intentionally stopped.  

### Volumes

No volumes are used in this architecture since there is no database or persistent storage needed for the services.

But this could easily be added in the future with:
```yaml
services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

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

The service C docker-compose has a `depends_on` property to ensure that it starts only after Service A and Service B are up and running.

It serves 1 page:
- `GET /`: Fetches data from Service A and Service B and displays it.

### Service D

This service is responsible for monitoring the other services in real-time using Netdata.

In docker compose, a netdata service is added to monitor all containers in real-time.
There is no `depends_on` since netdata should start independently of other services.

All `container_name` are set to have more readable names in netdata dashboard.
The Netdata configuration is registered in `services/service-d/netdata.conf`. It used on the custom netdata image build in `services/service-d/Dockerfile`.

#### Setup

If you want to monitor your containers with netdata, you can follow these steps:
- Make sure you have `docker-compose.yml` configured with netdata service.
- Start your services using Docker Compose: `docker compose up -d`.
- Goto `http://localhost:19999` in your web browser to access the Netdata dashboard.
- Follow the on-screen instructions to complete the setup.