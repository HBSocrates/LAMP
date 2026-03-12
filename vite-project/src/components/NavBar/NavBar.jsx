import React from "react";
import { Nav, NavLink, Bars, NavMenu, NavBtn, NavBtnLink } from "./NavBarElements";

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
                    <NavLink to="/rssFeed" >
                        Podcast RSS Feed
                    </NavLink>
                    <NavLink to="/about" >
                        About Me
                    </NavLink>
                    <NavLink to="/signUp">
                        Sign Up
                    </NavLink>
                </NavMenu>
                <NavBtn>
                    <NavBtnLink to="/signIn">
                        Sign In
                    </NavBtnLink>
                </NavBtn>
            </Nav>
        </>
    );
};

export default Navbar;