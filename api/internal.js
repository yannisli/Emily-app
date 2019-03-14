/**
 * Act as the middleman between the actual backend API server, so the browser does not know the access-token to make requests to the backend API
 * 
 */
const express = require("express");
const fetch = require("node-fetch");

const { catchAsyncMiddleware } = require("../utils");

const authenticateUser = require("./discord").AuthenticateUser;

const router = express.Router();

// Return if we're in this server or not
// Also Return current list of messages being watched for server id if we are
// 403 if we're not
// Have to use Bot tokens as this is outside of OAuth2 scope

/**
 * What should this respond with?
 * If the response was not okay, it should respond with the response status and a {exists: false}
 * If the response is okay from Discord (signalling that the bot has access)
 * We should then pull data from OUR side regarding the messages that we are currently watching for, and in what channels.
 * We then respond with that
 */
router.get("/exists/:id", catchAsyncMiddleware(async (req, res) =>
{
    const tokens = await authenticateUser(req, res);
   
    if(!tokens)
        throw new Error("InvalidTokens");
    let guildid = req.params.id;
    const response = await fetch(`https://discordapp.com/api/guilds/${guildid}/channels`,
    {
        method: "GET",
        headers: {
            'User-Agent': 'Emily (https://github.com/yannisli, 1.0)',
            'Authorization': `Bot ${process.env.BOT_TOKEN}`
        }
    });
    
    if(response.ok)
    {
        let json = await response.json();
        console.log("Okay!");
        res.status(200).json(json);
    }
    else
    {
        console.log("Not okay", response.status);
        res.status(response.status).json({exists: false});
    }
}));
/**
 * This pulls the Channels that the **bot** can see, used to populate the front-end when they do 'Create new message'
 * TODO: Maybe merge with exists
 */
router.get("/channels/:id", catchAsyncMiddleware(async (req, res) =>
{
    const tokens = await authenticateUser(req, res);
   
    if(!tokens)
        throw new Error("InvalidTokens");
    const response = await fetch(`https://discordapp.com/api/guilds/${guildid}/channels`,
    {
        method: "GET",
        headers: {
            'User-Agent': 'YukiBot (https://github.com/yannisli, 1.0)',
            'Authorization': `Bot MjcyNDIxMTg2MTY2NTg3Mzkz.D2ooqA.ziQQSJGnOkA-Y0Un3GQeOVtKlpg`
        }
    });
    if(response.ok)
    {
        let json = await response.json();

        res.status(200).json(json);
    }
    else
    {
        res.status(response.status);
    }
}));


module.exports = router;