import React from "react";
import "./App.css";
import Navbar from "./components/NavBar/index";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Home from "./pages";
import About from "./pages/about";
import MathGameApp from "./pages/MathGameApp";

function App() {

  return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mathApp" element={<MathGameApp />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </Router>
  )
}

export default App
