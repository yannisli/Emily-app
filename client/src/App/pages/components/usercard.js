import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

let dev = true;
class UserCard extends Component {
    constructor() {
        super();

        this.showCard = this.showCard.bind(this);
        this.closeCard = this.closeCard.bind(this);
    }
    render() {
        if(this.props.user && this.props.user.username)
        {
            let circleStyle = {
                display: 'inline-block',
                width: '32px',
                height: '32px',
                'borderRadius': '50%',
                background: `url(https://cdn.discordapp.com/avatars/${this.props.user.id}/${this.props.user.avatar}.png?size=32)`,
              
                
            };
            /*user = (
                <div style={{display: 'inline-block', 'font-family': 'Roboto', 'font-weight': 300, 'font-size': '16px'}}>
                    {`${this.props.user.username}\#${this.props.user.discriminator}`}
                    
                </div>
                
            );*/
            return (
                <div style={{
                    width: '32px',
                    height: '32px',
                    'marginTop': '8px',
                    'marginBottom': '8px',
                    'verticalAlign': 'middle',
                    'textAlign': 'center',
                    'float': 'right',
                    'marginRight': '240px',
                }}>
                    <div style={{position: 'relative'}}>
                        <button onClick={this.showCard} className="usercard_button">
                            <div style={circleStyle}></div>
                        </button>
                        {this.props.showCard && 
                            <div id="dropdown" className="usercard_content">
                                <div className="usercard_separator">
                                    <div>Logged in as:</div>
                                    <span>{this.props.user.username}</span><span style={{color: 'gray'}}>#{this.props.user.discriminator}</span>
                                </div>
                                <a className="usercard_logout" href={`${dev ? 'http://localhost:8080' : ''}/api/discord/logout`}>
                                    Log Out
                                </a>
                                
                            </div>
                        }
                    </div>
                    </div>
            );
        }
        return (<div style={{
            'float': 'right',
            'marginRight': '240px'
        }}>
            <a href={`${dev ? 'http://localhost:8080' : ''}/api/discord/login`} className="navbar_button">
                Login
            </a>
        </div>);
       
    }

    showCard(event) {
        event.preventDefault();

        this.props.dispatch({type: "USERCARD_CLICK"});
        document.addEventListener('click', this.closeCard);
    }

    closeCard() {
        this.props.dispatch({type: "USERCARD_DECLICK"});
        document.removeEventListener('click', this.closeCard);
    }
}

export default withRouter(connect(state => {
    return {user: state.user, guilds: state.guilds, showCard: state.showCard};
})(UserCard));