import React, { Component }  from 'react';

import { withRouter, Redirect, Link } from 'react-router-dom';

import { connect } from 'react-redux';


class ManageUI extends Component {
    constructor() {
        super();

    }
    
    render()
    {
        
        let guild = this.props.Guild;
        // To make sure we are not displaying data prematurely..
        // TODO: Maybe since we have a loading flag already set, we don't need this anymore and it's wasted compute time
        let id = this.props.location.pathname;
        id = id.split("/");
        id = id[id.length-1];
        // If we don't have this data from SELECT_GUILD, redirect to the root of Manage
        if(guild.name === undefined)
            return (<Redirect to='/manage'/>);
        // Administrator credentials, administrators should have 0x00000008 set to their permission
        let auth = (guild.permissions & 0x00000008) === 0x00000008;


        let weHaveChannelData = guild.Channels && guild.Channels.Channels;
        return (
        <div className="manageui">
          
            { /* Set our actual working space to less than the previous div since that was just to make the right side of the page the same background color */ }
            <div style={{
                'margin-left': '20px',
                'width': 'calc(100% - 226px)'
                }}>
               
                <br></br>
                <div style={{'margin-top': '24px'}}>
                    { /* Display the Guild Name & ID */ }
                    <span className="manageui_title">{guild.name}</span><span>#{guild.id}</span>
                    { /* This is so the error stuff looks centered... actually application won't use this kind of padded center display */ }
                    {(this.props.Loading || this.props.Redirecting || !weHaveChannelData) &&
                        <div style={{
                            'padding': '20%',
                            'margin': 'auto',
                            'text-align': 'center'
                        }}>
                            { /* Our data was all loaded but it looks like we're not in this guild */ }
                            {(!this.props.Loading && !this.props.Redirecting && (!weHaveChannelData || id !== guild.id)) &&
                                <div>
                                    
                                    Hmmmm.......<br/>
                                    Sorry, but it looks like I'm not in this desired guild!<br/><br/>
                                    {!auth &&
                                        <div>
                                            Looks like you don't have administrative permissions either...
                                        </div>
                                    }
                                    <a onClick={() => {
                                        this.props.dispatch({type: "BOT_REDIRECT", data: true});
                                    }}
                                    rel="noopener noreferrer" target="_blank" href="https://discordapp.com/api/oauth2/authorize?client_id=272421186166587393&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fmanage&scope=bot" className='login_button'>Let's fix that</a>
                                </div>
                            }
                            { /* Render redirecting stuff.. need a button because Discord OAuth2 add bot doesn't actually redirect us despite giving it a redirect_uri.. */}
                            {this.props.Redirecting &&
                                <div>
                                    Redirecting you to Discord to add the bot....<br/>
                                    <button className="login_button" onClick={ () => {
                                        this.props.dispatch({type: "MANAGE_LOADING", data: true});
                                        this.props.dispatch({type: "BOT_REDIRECT", data: false});
                                        let i = this.props.GuildKey;
                                        {/* TODO: Put this and the ManageList one under a singular function call instead of 2 separate instances of the same thing */}
                                        fetch(`/api/internal/exists/${guild.id}`, { method: 'GET'})
                                            .then(res => {
                                                if(!res.ok)
                                                {
                                                    
                                                    this.props.dispatch({type: "GUILD_CHANNELS", data: {key: i, channels: {}}});
                                                    
                                                    return;
                                                }
                                                res.json()
                                                    .then( json => {
                                                    
                                                        this.props.dispatch({type: "GUILD_CHANNELS", data: {key: i, channels: json}});
                                                
                                                        
                                                    })
                                                    .catch( err => {
                                                        this.props.dispatch({type: "GUILD_CHANNELS", data: {key: i, channels: {}}});
                                                        console.log("Internal JSON Error", err);
                                                    });
                                            })
                                            .catch( err => {
                                                this.props.dispatch({type: "GUILD_CHANNELS", data: {key: i, channels: {}}});
                                                console.log("Internal Fetch Error", err);
                                            });

                                    }
                                    }>Done? Let's see if we can do something now</button>
                                    <br/><br/>
                                    
                                </div>
                            }
                            
                            
                            { /* Our state says we're loading, so just put loading stuff here */ }
                            {this.props.Loading &&
                                <div>
                                    Loading data...
                                </div>
                            }
                        </div>
                    }
                    {/* Once all the data is loaded and the application returns that we are in this guild 
                        We are in the guild when Channels is filled out with valid Channel entries (aka 0 index should be another object, not undefined/null)
                    */}
                    {(!this.props.Loading && !this.props.Redirecting && (weHaveChannelData && id === guild.id)) &&
                        <div>
                            <hr/>
                            <br/>
                            <span className="manageui_subtitle">
                                Registered Messages
                            </span>
                            <div className="manageui_content">
                                {JSON.stringify(guild.Channels)}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>);
    }
    /**
     * Dispatch that we don't want to render redirecting, and that to render we are loading when we first load this component in case the states are set that way in the Store
     */
    componentDidMount() {
        console.log("ManageUI: componentDidMount()");
        this.props.dispatch({type: "BOT_REDIRECT", data: false});
        this.props.dispatch({type: "MANAGE_LOADING", data: true});
    }
}

export default withRouter(connect(state => {
    
    return {
        Guild: state.guilds && state.guilds[state.selectedGuild] ? state.guilds[state.selectedGuild] : {},
        GuildKey: state.selectedGuild,
        Redirecting: state.Redirecting,
        Loading: state.LoadingGuild
    };
})(ManageUI));