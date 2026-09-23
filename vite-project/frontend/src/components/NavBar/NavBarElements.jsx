import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    background: #1e293b;
    height: 85px;
    display: flex;
    justify-content: space-between;
    padding: 0.2rem calc((100vw - 1000px) / 2);
    z-index: 12;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const NavLink = styled(Link)`
    color: #94a3b8;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    transition: color 0.2s;
    &:hover {
        color: #ffffff;
    }
    &.active {
        color: #ffffff;
    }
`;

export const Bars = styled(FaBars)`
    display: none;
    color: #94a3b8;
    z-index: 13;
    @media screen and (max-width: 768px) {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(-100%, 75%);
        font-size: 1.8rem;
        cursor: pointer;
    }
`;

export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    margin-right: -24px;
    @media screen and (max-width: 768px) {
        display: none;
    }
`;

export const NavBtn = styled.nav`
    display: flex;
    align-items: center;
    margin-right: 24px;
    @media screen and (max-width: 768px) {
        display: none;
    }
`;

export const NavBtnLink = styled(Link)`
    border-radius: 4px;
    background: #6366f1;
    padding: 10px 22px;
    color: #ffffff;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    margin-left: 24px;
    &:hover {
        transition: all 0.2s ease-in-out;
        background: #4f46e5;
        color: #ffffff;
    }
`;

export const LogoutButton = styled.button`
    border-radius: 4px;
    background: #6366f1;
    padding: 10px 22px;
    color: #ffffff;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    margin-left: 24px;
    font: inherit;
    &:hover {
        transition: all 0.2s ease-in-out;
        background: #4f46e5;
        color: #ffffff;
    }
`;

export const MobileMenu = styled.div`
    display: none;
    @media screen and (max-width: 768px) {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 85px;
        left: 0;
        right: 0;
        background: #1e293b;
        padding: 1rem 0 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        z-index: 12;
    }
`;

export const MobileNavLink = styled(Link)`
    color: #94a3b8;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 1rem 1.5rem;
    width: auto;
    cursor: pointer;
    transition: color 0.2s;
    &.active {
        color: #ffffff;
    }
    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #ffffff;
    }
`;

export const MobileNavBtnLink = styled(MobileNavLink)`
    color: #ffffff;
    border-radius: 4px;
    background: #6366f1;
    padding: 12px 22px;
    margin: 0.75rem 1.5rem 0;
    align-self: flex-start;
    &:hover {
        background: #4f46e5;
        color: #ffffff;
    }
`;

export const MobileLogoutButton = styled.button`
    color: #ffffff;
    border-radius: 4px;
    background: #6366f1;
    padding: 12px 22px;
    margin: 0.75rem 1.5rem 0;
    align-self: flex-start;
    border: none;
    cursor: pointer;
    font: inherit;
    &:hover {
        background: #4f46e5;
        color: #ffffff;
    }
`;