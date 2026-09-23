import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Nav, NavLink, Bars, NavMenu, NavBtn, NavBtnLink, LogoutButton, MobileMenu, MobileNavLink, MobileNavBtnLink, MobileLogoutButton } from "./NavBarElements";

const isLoggedIn = () => localStorage.getItem('loggedIn') === 'true';

const Navbar = () => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        setMobileOpen(false);
        navigate('/');
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <>
            <Nav>
                <Bars onClick={() => setMobileOpen(!mobileOpen)} />
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
                </NavMenu>
                <NavBtn>
                    {isLoggedIn() ? (
                        <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>
                    ) : (
                        <>
                            <NavBtnLink to="/signUp">
                                Sign Up
                            </NavBtnLink>
                            <NavBtnLink to="/login">
                                Log In
                            </NavBtnLink>
                        </>
                    )}
                </NavBtn>
            </Nav>
            {mobileOpen && (
                <MobileMenu>
                    <MobileNavLink to="/" onClick={closeMobile}>
                        Home
                    </MobileNavLink>
                    <MobileNavLink to="/mathApp" onClick={closeMobile}>
                        Math Game
                    </MobileNavLink>
                    <MobileNavLink to="/rssFeed" onClick={closeMobile}>
                        Podcast RSS Feed
                    </MobileNavLink>
                    <MobileNavLink to="/RussianJiangi" onClick={closeMobile}>
                        Russian Jiangi
                    </MobileNavLink>
                    <MobileNavLink to="/about" onClick={closeMobile}>
                        About Me
                    </MobileNavLink>
                    {isLoggedIn() ? (
                        <MobileLogoutButton onClick={handleLogout}>Log Out</MobileLogoutButton>
                    ) : (
                        <>
                            <MobileNavBtnLink to="/signUp" onClick={closeMobile}>
                                Sign Up
                            </MobileNavBtnLink>
                            <MobileNavBtnLink to="/login" onClick={closeMobile}>
                                Log In
                            </MobileNavBtnLink>
                        </>
                    )}
                </MobileMenu>
            )}
        </>
    );
};

export default Navbar;