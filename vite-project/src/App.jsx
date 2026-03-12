import React from "react";
import "./styles/App.css";
import Navbar from "./components/NavBar/NavBar.jsx";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Home from "./pages";
import About from "./pages/about";
import MathGameApp from "./pages/MathGameApp";
import RSSFeed from "./pages/rssFeed";
import SignUp from "./pages/signUp";
import Login from "./pages/login";

function App() {

  return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mathApp" element={<MathGameApp />} />
                <Route path="/rssFeed" element={<RSSFeed />} />
                <Route path="/about" element={<About />} />
                <Route path="/signUp" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
  )
}

export default App
