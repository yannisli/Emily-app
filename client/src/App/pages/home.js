import React, { Component } from "react";

import "../styles.css";

import { connect } from 'react-redux';

//import { Link } from 'react-router-dom';

import NavBar from './components/navbar';

class Home extends Component {
    
    render() {
        /*let login = <a href="/api/discord/login" classname="login_button">Login via Discord</a>

        if(this.props.user && this.props.user.username)
            login = <Link to='/manage'>To Management</Link>;*/
        return (
            <div>
                <NavBar/>
                <div className="page">
                    <h1>
                        Project Home
                    </h1>
                    <hr/>
                </div>
               
                
                
            </div>
        );
    }


}

export default connect( state => {
    return {user: state.user, guilds: state.guilds};
})(Home);