const express = require("express");
const fetch = require("node-fetch");
const btoa = require("btoa");
const cookie = require("cookie");

const { catchAsyncMiddleware } = require("../utils");

const router = express.Router();

const port = process.env.PORT || 8080;

const redirect = encodeURIComponent(`${process.env.ROOT_URI}:${port}/api/discord/callback`);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
// Retrieve user information aside from e-mail & the guilds that they are in
// allows /users/@me without email
// allows /users/@me/guilds to return basic information about all of a user's guilds
const CLIENT_SCOPE = "identify%20guilds";


// Authenticate the user and return the access and refresh tokens if successful
// TODO: Read the cookies expiry date so we don't need to do an API request to validate the token
const authenticateUser = async (req, res) => {
    if(!req.headers || !req.headers.cookie)
        return false;
    const cookies = cookie.parse(req.headers.cookie);

    console.log(cookies);

    if(!cookies || !cookies.access_token || !cookies.refresh_token) {
        console.log("Cookies not present");
        return false;
    }
    // Has cookies.. but are they still valid?

    console.log("Cookies present");
    
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch (`https://discordapp.com/api/users/@me`,
    {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${cookies.access_token}`
        }
    });
    if(response.status == 401)
    {
        console.log("Response not okay, Error Code 401");
        // Access is not valid, so it could be we need to refresh
        const res2 = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=refresh_token&refresh_token=${cookies.refresh_token}&scope=${CLIENT_SCOPE}&redirect_uri=${redirect}`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`
            }
        });
        // Refresh wasn't successful, user isn't authenticated
        if(!res2.ok)
        {
            console.log("Refresh did not work");
            return false;
        }
        const json = await res2.json();
        // Refresh was successful, save the new access token
        res.cookie("access_token", json.access_token, {httpOnly: true, maxAge: json.expires_in * 1000});
        res.cookie("refresh_token", json.refresh_token, {httpOnly: true, maxAge: json.expires_in * 1000 * 2});
        console.log("Refresh successful, authenticated");
        return {access_token: json.access_token, refresh_token: json.refresh_token};
    }
    else
    {
        if(response.ok) {
            console.log("All okay");
            return {access_token: cookies.access_token, refresh_token: cookies.refresh_token};
        }
        else
            throw new Error(`Response was not OK: Code ${response.status}`);
    }
}









// Login
// If user is not authenticated, redirect them, otherwise do nothing
router.get("/login", (req, res) => {
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=${CLIENT_SCOPE}&response_type=code&redirect_uri=${redirect}`);
});
// Callback
// Validate the callback, get the code, ask for the access_token, and save the access_token as httpOnly cookie to be used for later sessions of the user
// TODO: Make it more secure than just cookies
router.get("/callback", catchAsyncMiddleware(async (req, res) => {
    if(!req.query.code) throw new Error("NoCodeProvided");
    const code = req.query.code;
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
    {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
        }
    });
    const json = await response.json();
    // Save Access_Token as a cookie
    console.log(json);
    res.cookie("access_token", json.access_token, {httpOnly: true, maxAge: json.expires_in * 1000});
    res.cookie("refresh_token", json.refresh_token, {httpOnly: true, maxAge: json.expires_in * 1000 * 2});
    res.redirect(`/Manage`);
}));

// Send back info based on user
router.get("/user", catchAsyncMiddleware(async (req, res) => {
    // Check Validation
    const tokens = await authenticateUser(req,res);
    console.log(tokens);
    if(!tokens)
        throw new Error("InvalidTokens");

    // Valid Tokens? fetch data from discord then

    const response = await fetch(`https://discordapp.com/api/users/@me`,
    {
        method: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${tokens.access_token}`
        }
    });

    const json = await response.json();

    console.log(json);

    
    res.send(json);

}));

router.get("/guilds", catchAsyncMiddleware(async (req, res) => {
    // Check Validation
    const tokens = await authenticateUser(req, res);
    if(!tokens)
        throw new Error("InvalidTokens");

    const response = await fetch(`https://discordapp.com/api/users/@me/guilds`,
    {
        method: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${tokens.access_token}`
        }
    });
    console.log(response.status);
    const json = await response.json();
    
    console.log(json);

    // Check if response code 401 then that means we need to refresh the token

    res.send(json);
}));
/*
router.get("/cookie", (req, res) => {
    const regularCookies = req.headers.cookie;
    console.log(`Regular Cookies:${regularCookies}`);

    res.redirect(`/`);
});*/
exports.AuthenticateUser = authenticateUser;
exports.DiscordRouter = router;