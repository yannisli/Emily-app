import React, { Component } from "react";

import { connect } from "react-redux";



//const fetch = require("node-fetch");

import NavBar from './components/navbar';

import { Route, Redirect, Switch, withRouter } from 'react-router-dom';

import ManageList from './components/managelist';

import ManageUI from './components/manageui';

//import NewMessageModal from './components/newmessage';
//import NewReactionModal from "./components/newreaction";
/**
 * Manage Page
 */
class Manage extends Component {
    constructor(props) {
        super(props);

        this.fetchChannelData = this.fetchChannelData.bind(this);
        this.fetchMessageData = this.fetchMessageData.bind(this);
    }
    
    render() {
       
        // As with any other page, display the NavBar component
        // Display ManageList component
        // Switch depending on path to display a welcome message, or the actual Management User Interface
        // Also handle if there are invalid URLs under /manage to redirect to the management home.
        // ManageUI will handle undefined/invalid guild ids to redirect to home
        return (
            <div>
                <div id="manage_root">
                    <NavBar/>
                    <div className="page_left">
                        <ManageList fetchChannelData={this.fetchChannelData}/>
                    </div>
            
                    <div className="page" style={{'marginLeft': '0px'}}>
                        <Switch>
                            <Route exact path='/manage'>
                                <div style={{'textAlign': 'center'}}>
                                    <h1>Welcome to Guilds Management!</h1>
                                    <hr/>
                                    <h2>Need Help?</h2>
                                    <hr/>
                                    Need help with existing features or you would like to submit bug reports/feature requests?<br/>
                                    Get in touch via Discord @ Emi#2464!
                                </div>
                            </Route>
                            <Route exact path='/manage/:id'>
                                <ManageUI fetchMessageData={this.fetchMessageData} fetchChannelData={this.fetchChannelData}/>
                                
                            </Route>
                            <Redirect from='/manage/*' to='/manage'/>
                        </Switch>
                    
                    </div>
                </div>
                {/*<NewReactionModal/>*/}
                {/*<NewMessageModal/>*/}
            </div>
        );
    }
    // Change our document title
    componentDidMount() {
        document.title = "Emily | Manage";
    }

    /*mapStateToProps(state) {
        return {
            user: state.user,
            guilds: state.guilds
        };
    }*/
    /**
     * Fetches channels data from the internal API
     * @param {Number} key The index at which the Guild we're requesting the data resides in
     */
    fetchChannelData(key) {
        console.log(`fetchChannelData(${key})`);
        fetch(`/api/internal/exists/${this.props.guilds[key].id}`, { method: 'GET'})
            .then(res => {
                if(!res.ok)
                {
                    
                    this.props.dispatch({type: "GUILD_CHANNELS", data: {key: key, res: {}}});
                    
                    return;
                }
                res.json()
                    .then( json => {
                        
                        this.props.dispatch({type: "GUILD_CHANNELS", data: {key: key, res: json}});
                    
                        
                    })
                    .catch( err => {
                        this.props.dispatch({type: "GUILD_CHANNELS", data: {key: key, res: {}}});
                        console.log("Internal JSON Error", err);
                    });
            })
            .catch( err => {
                this.props.dispatch({type: "GUILD_CHANNELS", data: {key: key, res: {}}});
                console.log("Internal Fetch Error", err);
            });
    }
    /**
     * Fetches messages data from the internal API
     * @param {Number} key The index at which the Guild we're requesting the data for resides in
     */
    fetchMessageData(key) {
        console.log(`fetchMessageData(${key})`);
        fetch(`/api/internal/messages/${this.props.guilds[key].id}`, { method: 'GET'})
            .then(res => {
                if(!res.ok)
                {
                    
                    this.props.dispatch({type: "GUILD_MESSAGES", data: {key: key, messages: {}}});
                    
                    return;
                }
                res.json()
                    .then( json => {
                        
                        this.props.dispatch({type: "GUILD_MESSAGES", data: {key: key, messages: json}});
                    
                        
                    })
                    .catch( err => {
                        this.props.dispatch({type: "GUILD_MESSAGES", data: {key: key, messages: {}}});
                        console.log("Internal JSON Error", err);
                    });
            })
            .catch( err => {
                this.props.dispatch({type: "GUILD_MESSAGES", data: {key: key, messages: {}}});
                console.log("Internal Fetch Error", err);
            });
    }
}

export default withRouter(connect(state => {
    return {
        guilds: state.guilds,
        AwaitingServer: state.AwaitingServer,
        ServerResponse: state.ServerResponse, // Results to display
    };
})(Manage));