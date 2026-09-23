import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    background: #333333;
    height: 85px;
    display: flex;
    justify-content: space-between;
    padding: 0.2rem calc((100vw - 1000px) / 2);
    z-index: 12;
`;

export const NavLink = styled(Link)`
    color: #808080;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    &.active {
        color: white;
    }
`;

export const Bars = styled(FaBars)`
    display: none;
    color: #808080;
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
    background: #808080;
    padding: 10px 22px;
    color: #000000;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    margin-left: 24px;
    &:hover {
        transition: all 0.2s ease-in-out;
        background: #ffffff93;
        color: #808080;
    }
`;

export const LogoutButton = styled.button`
    border-radius: 4px;
    background: #808080;
    padding: 10px 22px;
    color: #000000;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    margin-left: 24px;
    font: inherit;
    &:hover {
        transition: all 0.2s ease-in-out;
        background: #ffffff93;
        color: #808080;
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
        background: #333333;
        padding: 1rem 0 1.5rem;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        z-index: 12;
    }
`;

export const MobileNavLink = styled(Link)`
    color: #808080;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 1rem 1.5rem;
    width: auto;
    cursor: pointer;
    &.active {
        color: white;
    }
    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;
    }
`;

export const MobileNavBtnLink = styled(MobileNavLink)`
    color: #000000;
    border-radius: 4px;
    background: #808080;
    padding: 12px 22px;
    margin: 0.75rem 1.5rem 0;
    align-self: flex-start;
    &:hover {
        background: #ffffff93;
        color: #808080;
    }
`;

export const MobileLogoutButton = styled.button`
    color: #000000;
    border-radius: 4px;
    background: #808080;
    padding: 12px 22px;
    margin: 0.75rem 1.5rem 0;
    align-self: flex-start;
    border: none;
    cursor: pointer;
    font: inherit;
    &:hover {
        background: #ffffff93;
        color: #808080;
    }
`;
