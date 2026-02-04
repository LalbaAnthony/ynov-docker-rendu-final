const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MEMORY_LIMIT = process.env.MEMORY_LIMIT || 128;

app.use(cors());

app.get("/", (req, res) => {
    res.json({
        service: "service-a",
        message: "Welcome to Service A",
        status: "ok"
    });
});

app.get('/health', async (req, res) => {
    res.json({
        service: "service-a",
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage().rss,
        memory_limit: MEMORY_LIMIT * 1024 * 1024
    })
})

app.use(({ res }) => {
    return res.status(404).json({
        service: "service-a",
        message: "Nothing found here",
        status: "ko"
    })
})

app.listen(PORT, () => {
    console.log(`Service A running on port ${PORT}`);
});

// Watchdog interne
setInterval(() => {
    const mem = process.memoryUsage().rss / 1024 / 1024
    if (mem > MEMORY_LIMIT) {
        console.error('Memory limit reached, exiting')
        process.exit(1)
    }
}, 5000)

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

