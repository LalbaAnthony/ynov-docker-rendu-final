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
        status: "ok"
    });
});

app.use(({ res }) => {
    return res.status(404).json({
        service: "service-a",
        message: "Nothing found here",
        status: "ko"        
    })
})

app.listen(PORT, () => {
    console.log(`Service B running on port ${PORT}`);
});
