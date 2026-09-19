import React from "react";
import { useNavigate } from "react-router-dom";
import { Nav, NavLink, Bars, NavMenu, NavBtn, NavBtnLink, LogoutButton } from "./NavBarElements";

const isLoggedIn = () => localStorage.getItem('loggedIn') === 'true';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        navigate('/');
    };

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
                    <NavLink to="/RussianJiangi">
                        Russian Jiangi
                    </NavLink>
                    <NavLink to="/about" >
                        About Me
                    </NavLink>
                    {!isLoggedIn() && (
                        <NavLink to="/signUp">
                            Sign Up
                        </NavLink>
                    )}
                </NavMenu>
                <NavBtn>
                    {isLoggedIn() ? (
                        <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>
                    ) : (
                        <NavBtnLink to="/login">
                            Log In
                        </NavBtnLink>
                    )}
                </NavBtn>
            </Nav>
        </>
    );
};

export default Navbar;