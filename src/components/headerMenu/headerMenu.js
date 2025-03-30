'use strict';
import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import Voting from "../voting/voting.js";
import Timer from "../timer/timer.js";
import Weather from "../weather/weather.js";
import TodoList from "../todoList/todoList.js";
import { useTheme } from '../ThemeProvider.js';

import "./headerMenu.scss";

export const menuItems = [
    { path: '/', textNav: 'Головна', component: <TodoList/> },
    { path: '/weather', textNav: 'Погода', component: <Weather/>},
    { path: '/taimer', textNav: 'Таймер', component: <Timer/>},
    { path: '/voting', textNav: 'Голосування', component: <Voting/> },
];

export default ({ userName, onChangeName }) => {
    const { theme, toggleTheme } = useTheme();

    const [newUserName, setNewUserName] = useState(userName); 
    const [showEditName, setShowEditName] = useState(false);

    const handleEditClick = () => {
        setNewUserName(userName);
        setShowEditName(true);
    };

    const changeName = (event) => {
        setNewUserName(event.target.value); 
    };

    const saveEdit = () => {
        if(!newUserName.trim()) {
            return;
        }

        onChangeName(newUserName.trim());
        setShowEditName(false);
    };

    return (
        <div className="header">
            <div className="user-name-block">
                <span>Користувач: </span> 
                {showEditName ? (
                    <div className='edit-name'>
                        <input
                            className="user-input-name"
                            value={newUserName}
                            onChange={changeName}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()} 
                        />
                        <button className='save-btn' onClick={saveEdit}>✓</button>
                    </div>
                ) : (
                    <span className="user-name" onClick={handleEditClick}>{newUserName}</span>
                )}
            </div>

            <nav className="header-menu">
                {menuItems.map(({path, textNav}) => (
                    <NavLink key={path} className="header-menu-item" to={path}>
                        {textNav}
                    </NavLink>
                ))}
            </nav>

            <div className="language-block">
                <div className={`theme-app ${theme}`}>
                    <div>Тема: <span className="theme-toggle" onClick={toggleTheme}>{theme}</span></div>
                </div>
            </div>
        </div>
    );
};