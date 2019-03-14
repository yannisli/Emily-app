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
                    This project was started to demonstrate aptitude in JavaScript, HTML, CSS & the popular frameworks and libraries within the languages, namely ReactJS, Redux, Node.js,
                        Express.js, and Mongoose and utilizing design paradigms such as RESTful API for stateless data loading. This bot is being created with the goal in mind to facilitate
                        a better User Experience for some popular features of other Discord bots that are of a command-line interface by introducing a responsive web-application front-end
                        as an alternative. Namely Reaction Role, and other bots that carry out administrative/utility tasks.
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