import React, { Component } from 'react';

import { Link, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

import UserCard from './usercard';

class NavBar extends Component {
    render() {
        //let user = <a href='/api/discord/login' className="navbar_button">Login</a>
        let manage = "";
        if(this.props.user && this.props.user.username)
        {
            
            manage = <Link to='/manage' className={this.props.location.pathname.includes("/manage") ? "navbar_button_active" : "navbar_button"}>Manage</Link>;
        }
        return (
            <div className="navbar">
                <div style={{display: 'inline-block', width: '256px'}}/>
                <Link to='/' className={this.props.location.pathname === '/' ? "navbar_button_active" : "navbar_button"}>Home</Link>
                <Link to='/about' className={this.props.location.pathname.includes("/about") ? "navbar_button_active" : "navbar_button"}>About</Link>
                {manage}
               
                <div style={{
                    width: '32px',
                    height: '32px',
                    'margin-top': '8px',
                    'margin-bottom': '8px',
                    'vertical-align': 'middle',
                    'text-align': 'center',
                    'float': 'right',
                    'margin-right': '240px',
                }}>
                    <UserCard/>
                </div>
            
            
            </div>
        );
    }
}
// We want this.props.location so we have to export withRouter
export default withRouter(connect(state => {
    return {user: state.user, guilds: state.guilds};
})(NavBar));