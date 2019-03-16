/**
 * Act as the middleman between the actual backend API server, so the browser does not know the access-token to make requests to the backend API
 * 
 */
const express = require("express");
const fetch = require("node-fetch");

const { catchAsyncMiddleware } = require("../utils");

const authenticateUser = require("./discord").AuthenticateUser;

const router = express.Router();

const internalURI = (`${process.env.API_URI}${process.env.API_PORT !== '80' ? `:${process.env.API_PORT}` : ""}`);

console.log(internalURI);

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
        console.log(json);
        //res.status(200).json(json);

        let resURI = `${internalURI}/api/getReactions`;
        console.log(resURI);
        const res2 = await fetch(`${resURI}`,
        {
            method: "GET",
        });

        if(!res2.ok)
        {
            console.log("We did not get an OK response from our internal server");
            res.status(res2.status).json({exists: false})
        }
        else
        {
            console.log("We got an OK response from internal server");
            let json2 = await res2.json();

            console.log(json2);
             //res.status(200).json(json);
            // json2 returns as an array of objects

            let discData = {};

            // Now that we got all the stuff from Mongo, we need to retrieve the actual message contents, we already got channel names from json
            // json returns as an array of objects
            

            let channels = {};

            for(let i = 0; i < json.length; i++)
            {
                if(Number(json[i].type) !== 0)
                    continue;
                channels[json[i].id] = json[i].name;
            }

            discData.Channels = channels;

            // Pull messages now from Discord API...

            discData.Messages = [];

            for(let i = 0; i < json2.length; i++)
            {
                // Check if this exists within our guild
                // TODO: remove this, its because our restapi doesn't search via guild
                // TODO: Redo on channel by channel basis, or just add guild to the schema
                if(!channels[json2[i].channel])
                    continue;
                const msg = await fetch(`https://discordapp.com/api/channels/${json2[i].channel}/messages/${json2[i].message}`,
                {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Emily (https://github.com/yannisli, 1.0)',
                        'Authorization': `Bot ${process.env.BOT_TOKEN}`
                    }
                });

                if(msg.ok)
                {
                    let msgJson = await msg.json();
                    discData.Messages.push({
                        contents: msgJson.content,
                        author: msgJson.author,
                        id: msgJson.id,
                        channel: msgJson.channel_id
                    });
                }
            }

            console.log("Done fetching all data..");
            console.log(discData);

            res.status(200).json(discData);
        }
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
 
router.get("/channels/:id", catchAsyncMiddleware(async (req, res) =>
{
    const tokens = await authenticateUser(req, res);
   
    if(!tokens)
        throw new Error("InvalidTokens");
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

       
    }
    else
    {
        res.status(response.status);
    }
}));
*/

router.get("/messages/:channel/:message", catchAsyncMiddleware(async (req, res) =>
{
    const tokens = await authenticateUser(req, res);

    if(!tokens)
        throw new Error("InvalidTokens");
    let channel = req.params.channel;
    let message = req.params.message;

    const response = await fetch(`https://discordapp.com/api/channels/${channel}/messages/${message}`,
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

        res.status(200).json(json);
    }
    else
    {
        res.status(response.status);
    }
}));


module.exports = router;