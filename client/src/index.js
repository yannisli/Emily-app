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
    channels - <object> Object representing the Channels for the Guild at props.guilds[key]
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
        case "MANAGE_LIST_LOADING":
            newState.LoadingGuildList = action.data;
            return newState;
        case "MANAGE_LOADING":
            newState.LoadingGuild = action.data;
            return newState;
        case "BOT_REDIRECT":
            newState.Redirecting = action.data;
            return newState;
        case "GUILD_CHANNELS":
            
            let newGuild = Object.assign({}, newState.guilds[action.data.key], {Channels: action.data.channels});
            newState.guilds[action.data.key] = newGuild;
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