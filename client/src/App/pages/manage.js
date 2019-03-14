import React, { Component } from "react";

import { connect } from "react-redux";



//const fetch = require("node-fetch");

import NavBar from './components/navbar';

import { Route, Redirect, Switch, withRouter } from 'react-router-dom';

import ManageList from './components/managelist';

import ManageUI from './components/manageui';

class Manage extends Component {
    
    render() {
       
    
        return (
            <div>
                <NavBar/>
                <div className="page_left">
                    <ManageList/>
                </div>
        
                <div className="page" style={{'margin-left': '2px'}}>
                    <Switch>
                        <Route exact path='/manage'>
                            <div style={{'text-align': 'center'}}>
                                <h1>Welcome to Guilds Management!</h1>
                                <hr/>
                                <h2>Need Help?</h2>
                                <hr/>
                                Need help with existing features or you would like to submit bug reports/feature requests?<br/>
                                Get in touch via Discord @ Emi#2464!
                            </div>
                        </Route>
                        <Route exact path='/manage/:id'>
                            <ManageUI/>
                        </Route>
                        <Redirect from='/manage/*' to='/manage'/>
                    </Switch>
                   
                </div>
            </div>
        );
    }
    


    /*mapStateToProps(state) {
        return {
            user: state.user,
            guilds: state.guilds
        };
    }*/
}

export default withRouter(connect(state => {
    return {};
})(Manage));