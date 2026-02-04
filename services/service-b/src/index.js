const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());

app.get("/", (req, res) => {
    res.json({
        service: "service-b",
        message: "Welcome to Service B",
        status: "ok"
    });
});

app.get('/health', async (req, res) => {
    res.json({
        service: "service-b",
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage().rss,
    })
})

app.use(({ res }) => {
    return res.status(404).json({
        service: "service-b",
        message: "Nothing found here",
        status: "ko"
    })
})

app.listen(PORT, () => {
    console.log(`Service B running on port ${PORT}`);
});

// Watchdog interne
setInterval(() => {
    const mem = process.memoryUsage().rss / 1024 / 1024
    if (mem > 950) {
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

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
