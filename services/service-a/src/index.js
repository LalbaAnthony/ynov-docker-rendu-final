const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());

app.get("/", (req, res) => {
    res.json({
        service: "service-a",
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
    console.log(`Service A running on port ${PORT}`);
});
