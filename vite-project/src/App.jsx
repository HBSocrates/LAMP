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
import RSSFeed from "./pages/RSSFeed";

function App() {

  return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mathApp" element={<MathGameApp />} />
                <Route path="/rssFeed" element={<RSSFeed />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </Router>
  )
}

export default App
