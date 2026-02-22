import React from "react";
import {
    Nav,
    NavLink,
    Bars,
    NavMenu,
} from "./navBarElements.jsx";

const Navbar = () => {
    return (
        <>
            <Nav>
                <Bars />
                <NavMenu>
                    <NavLink to="/" >
                        Home
                    </NavLink>
                    <NavLink to="/mathApp" >
                        Math Game
                    </NavLink>
                    <NavLink to="/about" >
                        About Me
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};

export default Navbar;