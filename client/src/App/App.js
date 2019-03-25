import React, { Component } from 'react';
import {Route, Switch, Redirect, withRouter} from "react-router-dom";
import "./styles.css";

import Home from "./pages/home";
import Manage from "./pages/manage";
import About from "./pages/about";

import { connect } from 'react-redux';

const fetch = require("node-fetch");


// React based on url to render what we want to see
class App extends Component {
  render() { 
    return (
      <div className="App">
      
        <Switch>
          <Route exact path='/' component={Home}/>
          {/* If there is no username, we don't want to render Manage page if users were there before */}
          {this.props.User.username &&
            <Route path='/manage' component={Manage}/>
          }
          <Route path='/about' component={About}/>
          <Redirect from="*" to="/"/>
        </Switch>
      </div>
    );
  }

  componentDidMount() {
    fetch(`/api/discord/user`, { method: 'GET'})
      .then( res => {
          if(!res.ok)
          {
              console.log("User Response was not okay, status code: " + res.status);
              
              return;
          }
          res.json()
              .then( json => {
                  
                  this.props.dispatch({type: "USER_UPDATE", data: json});
                  // Now fetch guilds!
                  fetch(`/api/discord/guilds`, { method: 'GET'})
                    .then( res => {
                        if(!res.ok)
                        {
                            console.log("Guilds Response was not okay, status code: " + res.status);
                            this.props.dispatch({type: "GUILDS_UPDATE", data: {}});
                            return;
                        }
                        res.json()
                            .then( json => {
                                
                                this.props.dispatch({type: "GUILDS_UPDATE", data: json});
                            })
                            .catch( err => {
                                console.log("Guilds .JSON Errored", err);
                                this.props.dispatch({type: "GUILDS_UPDATE", data: {}});
                            });
                    })
                    .catch( err => {
                        console.log("Guilds Fetch Errored", err);
                        this.props.dispatch({type: "GUILDS_UPDATE", data: {}});
                    });
              })
              .catch( err => {
                  console.log("User .JSON Errored", err);
              });
      })
      .catch( err => {
          console.log("User Fetch Errored", err);
      });
  
  
  
  }
    
}

// We do not use anything here, we just need the Dispatch function for Redux store.
// We have to use withRouter as well, or else things won't get re-rendered when we use Link to and etc.
export default withRouter(connect(state => {
  return {User: state.user};
})(App));
