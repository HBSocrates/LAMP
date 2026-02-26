import React from 'react';
import "../styles/App.css";
import mathLogo from "../assets/math.svg";

const Home = () => {
  return (
      <>
        <div>
          <a href="/">
            <img src={mathLogo} className="logo math" alt="Math logo" />
          </a>
        </div>
        <h1>Andy Yang</h1>
        <div className="card">
          <p>
            Welcome to my site! This is a place where I will be testing some react libraries and building some fun projects.
          </p>
        </div>
      </>
  )
};

export default Home;
