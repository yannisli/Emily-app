import React, { Component } from "react";

import NavBar from "./components/navbar";
class About extends Component {
    render() {
        return (
            <div>
                <NavBar/>
                <div className="page">
                    <h1>About</h1>
                    <hr></hr>
                    <p>
                    This project was started as a hobby to demonstrate aptitude in Web Development. It was not intended to displace and takeover the market for current bots that provide similar features, however it aims to provide similar functionality to them.
                    </p>
                    <h1>Features</h1>
                    <hr></hr>
                    <p>
                        Currently in development....
                    </p>
                </div>
            </div>
        );
    }

    componentDidMount() {
        document.title = "Emily | About";
    }
}

export default About;