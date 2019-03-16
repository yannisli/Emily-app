# Emily-app
This is the application side of Emily that is being created using React.js, Redux, React-Router, Express.js.
It utilizes node-fetch for HTTP API requests.

It also utilizes Discord's OAuth2 service to login and pull relevant information for the user (ex. missing bot from server)

## PROJECT DEPEDENCIES
btoa
body-parser
cookies
dotenv
express
morgan
node-fetch
path
react
react-dom
react-redux
react-router-dom
redux

You will need to create a .env file that contains the following:

### PORT
The port in which the Express.js will listen on, React.js will need to proxy to this port as well
### CLIENT_ID
The Client ID of your Discord bot application, you can obtain this in the General Information section of your Application at https://discordapp.com/developers/applications/
### CLIENT_SECRET
The Client Secret of your Discord bot application
### BOT_TOKEN
The Bot Token of your Discord bot application, you can obtain this under the Bot section of your Application
### ROOT_URI
The URI to point to for redirect_uri requests on behalf of Discord, ex. (http://localhost)
### API_PORT
The port in which the MongoDB RESTful API service will operate on ex. (80)
### API_URI
The URL in which we will go to for the MongoDB RESTful API service ex. (http://localhost)