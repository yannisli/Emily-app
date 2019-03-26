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
        
        const res2 = await fetch(`https://discordapp.com/api/guilds/${guildid}/roles`,
        {
            method: "GET",
            headers: {
                'User-Agent': 'Emily (https://github.com/yannisli, 1.0)',
                'Authorization': `Bot ${process.env.BOT_TOKEN}`
            }
        });
        if(res2.ok)
        {

            let roles = await res2.json();

            let data = {};
            
            data.Roles = {};

            for(let i = 0; i < roles.length; i++)
            {
                if(roles[i].managed)
                    continue;
                data.Roles[roles[i].id] = {
                    color: roles[i].color,
                    name: roles[i].name,
                    permissions: roles[i].permissions,
                    id: roles[i].id
                };
            }

            let channels = {};

            for(let i = 0; i < json.length; i++)
            {
                if(Number(json[i].type) !== 0)
                    continue;
                channels[json[i].id] = json[i].name;
            }

            data.Channels = channels;

            res.status(200).json(data);
        }
        else
        {
            res.status(res2.status).json({exists: false, error: 'Failed at role fetch'});
        }
    }
    else
    {
        console.log("Not okay", response.status);
        res.status(response.status).json({exists: false, error: 'Failed at guild fetch'});
    }
}));

router.get("/messages/:id", catchAsyncMiddleware(async (req,res) => {
    console.log(`/messages/${req.params.id}`);
    const tokens = await authenticateUser(req, res);
   
    if(!tokens)
        throw new Error("InvalidTokens");
    let guildid = req.params.id;
    let resURI = `${internalURI}/api/reactions/${guildid}`;
    console.log(resURI);
    const response = await fetch(`${resURI}`,
    {
        method: "GET",
    });

    if(!response.ok)
    {
        console.log(`Error from internal server, response received: ${response.status}`);
        res.status(500);
    }
    else
    {
        let json = await response.json();

        let messages = [];

        for(let i = 0; i < json.length; i++)
        {
            const msg = await fetch(`https://discordapp.com/api/channels/${json[i].channel}/messages/${json[i].message}`,
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
                let reacts = {};
                if(msgJson.reactions && msgJson.reactions.length > 0) {
                    for(let j = 0; j < msgJson.reactions.length; j++)
                    {
                        reacts[msgJson.reactions[j].emoji.id] = msgJson.reactions[j].count;
                    }
                }
                console.log(msgJson.reactions);
                messages.push({
                    contents: msgJson.content,
                    author: msgJson.author,
                    id: msgJson.id,
                    channel: msgJson.channel_id,
                    reactions: json[i].reactions,
                    discReactions: reacts
                });
            }
            else
            {
                messages.push({
                    error: `Failed to retrieve from Discord API for Message ID ${json[i].message}`
                });
            }
        }

        res.status(200).json(messages);
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
// Create new reaction for message in channel
router.post("/reactions/create", catchAsyncMiddleware(async (req, res) =>
{
    const tokens = await authenticateUser(req, res);

    if(!tokens)
        throw new Error("InvalidTokens");

    let body = req.body;

    console.log("body", body);

    if(!body || !body.emoji || !body.role || !body.guild_id || !body.channel_id || !body.message_id)
    {
        res.status(400);
        return;
    }
    let p = `${internalURI}/api/reactions/create`;
    // API request to backend
    const response = await fetch(p,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if(response.ok)
    {
        res.status(200);
    }
    else
        res.status(response.status);
}));

router.delete("/reactions/:message/:emoji", catchAsyncMiddleware(async (req, res) =>
{
    const tokens = await authenticateUser(req, res);
    if(!tokens)
        throw new Error("InvalidTokens");

    let p = `${internalURI}/api/reactions/${req.params.message}/${req.params.emoji}`
    const response = await fetch(p,
    {
        method: 'DELETE'
    });

    if(response.ok)
    {
        res.status(200);
    }
    else
        res.status(response.status);
}));
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
        const res2 = await fetch(`https://discordapp.com/api/channels/${channel}`,
        {
            method: "GET",
            headers: {
                'User-Agent': 'Emily (https://github.com/yannisli, 1.0)',
                'Authorization': `Bot ${process.env.BOT_TOKEN}`
            }
        });
        if(res2.ok)
        {
            let json2 = await res2.json();
            console.log("Returned them with", json);
            res.status(200).json(Object.assign({}, json, {channelName: json2.name}));
        }
        else
        {
            res.status(res2.status);
        }
        
    }
    else
    {
        res.status(response.status);
    }
}));

router.get("/emojis/:id", catchAsyncMiddleware(async (req, res) =>
{
    const tokens = await authenticateUser(req, res);

    if(!tokens)
        throw new Error("InvalidTokens");
    
    let guild = req.params.id;

    const response = await fetch(`https://discordapp.com/api/guilds/${guild}/emojis`,
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