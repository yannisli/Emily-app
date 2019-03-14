const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const logger = require("morgan");

require('dotenv').config();

const app = express();

const discordRouter = require("./api/discord").DiscordRouter;
const internalRouter = require("./api/internal");

const url = require("url");

// Logging
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(logger("dev"));

// Serve static file from react app
app.use(express.static(path.join(__dirname, 'client/build'), { index: false}));

// Routed paths
app.use('/api/discord', discordRouter);
app.use('/api/internal', internalRouter);

// Send index for any req that don't fall under our above routed paths

app.get("*", (req, res) => {
    console.log("hmm");
    if(req.headers.host.slice(0, 4) === 'www.') {
        console.log("it's www..");
        let newHost = req.headers.host.slice(4);
        console.log(`newHost: ${newHost}`);
        res.redirect(url.format({
            protocol: req.protocol,
            host: newHost,
            pathname: req.originalUrl
        }));
        
    }
    else
        res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Express.js now running on ${port}`);
});