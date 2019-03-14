const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const logger = require("morgan");

const app = express();

const discordRouter = require("./api/discord").DiscordRouter;
const internalRouter = require("./api/internal");

// Logging
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(logger("dev"));

// Serve static file from react app
app.use(express.static(path.join(__dirname, 'client/build')));

// Routed paths
app.use('/api/discord', discordRouter);
app.use('/api/internal', internalRouter);

// Send index for any req that don't fall under our above routed paths
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Express.js now running on ${port}`);
});