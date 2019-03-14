import React, { Component } from 'react';

import { withRouter, Link } from 'react-router-dom';

import { connect } from 'react-redux';


let devMode = true;
class ManageList extends Component {
    render() {
        // Array of elements to be returned
        let guilds = [];

        // ID of our current location, so we can render the guild selected properly
        let id = this.props.location.pathname;
        id = id.split("/");
        id = id[id.length-1];
        
        // If we have guilds.. lets loop through them and push them into the array
        if(this.props.guilds && this.props.guilds[0]) {
            for(let i = 0; i < this.props.guilds.length; i++)
            {
                // Permissions! Administrators must have 0x00000008
                // We don't want to render any that we don't have admin permissions to.
                // TODO: Just don't send them this info from server-side
                let permissions = this.props.guilds[i].permissions;

                // Check
                let auth = (permissions & 0x00000008) === 0x00000008;
            
                if(!auth && !devMode)
                    continue;
                
                // We don't want names too long, cut them off if they are
                let name = this.props.guilds[i].name;
                let icon = "";
                
                if(name.length > 23)
                {
                    name = name.substr(0,23) + "...";
                }
                // If this guild has an avatar
                if(this.props.guilds[i].icon)
                {
                    // Set the background pointing to the URL which is /icons/guild_id/hash.png
                    // We request a size of 32x32
                    icon = (<div key={i} className="avatar" style={{
                        background: `url(https://cdn.discordapp.com/icons/${this.props.guilds[i].id}/${this.props.guilds[i].icon}.png?size=32)`
                    }}/>);
                }
                else
                {
                    // Doesn't have an icon, so as with Discord does, just make it display the very first character
                    icon = (<div key={i} className="avatar">{this.props.guilds[i].name.substr(0,1)}</div>)
                }
                // The JSX to push into the array
                let elements = (
                    // Link to the management page which is /manage/:id
                    // When they click on it, we should push a state update that informs the application which guild we have selected so that the other components know what to display
                    // We should also initiate the network request here to fetch the data of this selected guild
                    // As this does it using React-Router, it will not trigger a componentDidMount() if we were viewing the component before hand already..
                    // TODO: Think of a way to consolidate the two fetch functions (one is here and the other is in ManageUI)
                    <Link to={`/manage/${this.props.guilds[i].id}`} key={i} onClick={() => {
                        this.props.dispatch({type: "SELECT_GUILD", data: i});
                        // Fetch data
                        fetch(`/api/internal/exists/${this.props.guilds[i].id}`, { method: 'GET'})
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
                    }}>
                        <div key={i} className={this.props.guilds[i].id === id ? "selected_guild" : "guild"}>
                            {icon}
                            <span>{name}</span>
                            <br></br>
                        </div>
                    </Link>
                )
                guilds.push(elements);
            }
        }
        else
        {
            // We don't have any guilds, swap depending what we're doing state-wise
            guilds = (
                <div>
                    { /* We're loading, so display that we're loading */ }
                    {this.props.Loading &&
                        <div style={{'text-align': 'center'}}>
                            Loading Guilds...
                        </div>
                    }
                    { /* This user is not in any guilds, so display that */ }
                    {!this.props.Loading &&
                        <div style={{'text-align': 'center'}}>
                            You don't belong in any guilds...
                        </div>
                    }
                </div>
            );
        }
        return (
            <div>
                {guilds}
            </div>
        );
    }
    /**
     * Dispatch that we would like to render Loading when this component has mounted
     */
    componentDidMount() {
        this.props.dispatch({type: "MANAGE_LIST_LOADING", data: true});
    }
}

export default withRouter(connect(state => {
    return { guilds: state.guilds, Loading: state.LoadingGuildList};
})(ManageList));