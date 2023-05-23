const express = require("express");
const config = require("./config.json");

const app = express();
const port = config.server.port;

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});