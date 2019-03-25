import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App/App';
import * as serviceWorker from './App/serviceWorker';

import { createStore } from 'redux';

import { Provider } from 'react-redux';

import { BrowserRouter } from "react-router-dom";

const initialState = {
    user: {},
    guilds: {}
};
/*
MANAGE_LIST_LOADING - ManageList is loading?
data - <boolean> Are we still loading

Will be set to false by GUILDS_UPDATE

MANAGE_LOADING - Management UI is loading?
data - <boolean> Are we loading data for the manage ui

Will be set to false by GUILD_CHANNELS
Will also be set to true by SELECT_GUILD

BOT_REDIRECT - Redirecting to Discord?
data - <boolean> Are we redirecting the user to Discord to add the bot

Will be set to false by SELECT_GUILD as well as when the user clicks the button, as well as when the componentDidMount()

SELECT_GUILD - We have selected this guild in Manage
key - <integer> Internal Key in the props.guilds array

GUILD_CHANNELS - We have Channels data for the selected guild in Manage
data - {
    key - <integer> Internal Key in the props.guilds array
    channels - <Array of Objects> Object representing the Channels for the Guild at props.guilds[key]
}
USERCARD_CLICK - Usercard was clicked, show

USERCARD_DECLICK - Elsewhere was clicked, stop showing

GUILDS_UPDATE - Pulled info from Discord OAuth2 for the guilds the **USER** is in

USER_UPDATE - Pulled info from Discord OAuth2 for the user info


*/
const reduxReducer = (oldState = initialState, action) => {
    console.log("Reduce", oldState, action);
    let newState = Object.assign({}, oldState);
    switch(action.type) {
        case "NEW_REACTION_EMOJI_LOADING":
            newState.LoadingEmoji = true;
            return newState;
        case "NEW_REACTION_EMOJI_DATA":
            newState.EmojiList = action.data;
            newState.LoadingEmoji = false;
            return newState;
        case "NEW_REACTION_EMOJI_CLICK":
            newState.ShowEmojiDropdown = true;
            return newState;
        case "NEW_REACTION_EMOJI_CLICKOFF":
            newState.ShowEmojiDropdown = false;
            return newState;
        case "NEW_REACTION_EMOJI_SELECT":
            newState.ChosenEmoji = action.data;
            return newState;
        case "NEW_REACTION_ROLE_CLICK":
            newState.ShowRoleDropdown = true;
            return newState;
        case "NEW_REACTION_ROLE_CLICKOFF":
            newState.ShowRoleDropdown = false;
            return newState;
        case "NEW_REACTION_ROLE_SELECT":
            newState.ChosenRole = action.data;
            return newState;
        case "NEW_REACTION_CLICK":
            newState.CreatingReaction = true;
            newState.CurrentMessage = action.data;
            return newState;
        case "NEW_REACTION_CLICKOFF":
            newState.CreatingReaction = false;
            newState.CurrentMessage = undefined;
            // As Role and Emoji dropdown are tied to Creating Reaction, also set their state to false.
            newState.ShowRoleDropdown = false;
            newState.ShowEmojiDropdown = false;
            return newState;
        case "NEW_MESSAGE_PREVIEW_LOADING":
            newState.MessagePreviewLoading = true;
            return newState;
        case "NEW_MESSAGE_PREVIEW":
            newState.MessagePreviewLoading = false;
            newState.PreviewMessage = action.data;
            return newState;
        case "NEW_MESSAGE_ALLOWBOT":
            newState.BotAllow = action.data;
            return newState;
        case "NEW_MESSAGE_CLICK":
            newState.CreatingMessage = true;
            return newState;
        case "NEW_MESSAGE_CLICKOFF":
            newState.CreatingMessage = false;
            return newState;
        case "MANAGE_MESSAGES_LOADING":
            newState.LoadingGuildMessages = action.data;
            return newState;
        case "MANAGE_LIST_LOADING":
            newState.LoadingGuildList = action.data;
            return newState;
        case "MANAGE_LOADING_CHANNEL":
            newState.LoadingGuild = action.data;
            return newState;
        case "BOT_REDIRECT":
            newState.Redirecting = action.data;
            return newState;
        case "GUILD_MESSAGES":
            newState.guilds[action.data.key] = Object.assign({}, newState.guilds[action.data.key], {Messages: action.data.messages});
            newState.LoadingGuildMessages = false;
            return newState;
        case "GUILD_CHANNELS":
            /*
                
            */
            newState.guilds[action.data.key] = Object.assign({}, newState.guilds[action.data.key], {Channels: action.data.res.Channels, Roles: action.data.res.Roles});
            newState.LoadingGuild = false;
            return newState;
        case "SELECT_GUILD":
            newState.selectedGuild = action.data;
            newState.LoadingGuild = true;
            newState.Redirecting = false;
            return newState;
        case "USERCARD_CLICK":
            newState.showCard = true;
            return newState;
        case "USERCARD_DECLICK":
            newState.showCard = false;
            return newState;
        case "GUILDS_UPDATE":
            newState.guilds = action.data;
            newState.LoadingGuildList = false;
            return newState;
        case "USER_UPDATE":
            newState.user = action.data;
            return newState;
        default:
            return newState;
    }
    
}
const store = createStore(reduxReducer);



ReactDOM.render((
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
