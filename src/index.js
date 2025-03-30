'use strict';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route  } from "react-router-dom"; 

import ErrorBoundary from "./components/ErrorBoundary.js";
import HeaderMenu, { menuItems } from './components/headerMenu/headerMenu.js';
import { ThemeProvider } from './components/ThemeProvider.js';

import './style.scss';

const MainContent = () => { 
    return (
        <div className="main-content">
            <Routes>
                {menuItems.map(({ path, component }, index) => (
                    <Route key={index} path={path} element={component} /> 
                ))}
            </Routes>
        </div>
    );
};

const RootComponent = () => {
    const [userName, setUserName] = useState(() => JSON.parse(localStorage.getItem('SPA_USER_NAME')) || '');

    const changeUserName = (newUserName) => {
        setUserName(newUserName);
        localStorage.setItem('SPA_USER_NAME', JSON.stringify(newUserName));
    };

    useEffect(() => {
        if (!userName) {
            const name = prompt('Привіт, як тебе звуть?')?.trim() || 'Анонім';
            setUserName(name);
            localStorage.setItem('SPA_USER_NAME', JSON.stringify(name));
        }
    }, [userName]);

    return (
        <ErrorBoundary>
            <HashRouter>
            {userName && (
                <ThemeProvider>
                    <HeaderMenu userName={userName} onChangeName={changeUserName} />
                    <MainContent />
                </ThemeProvider>
            )}
            </HashRouter>
        </ErrorBoundary>
    );
};


const rootNodeElement = document.querySelector('#main');
const root = ReactDOM.createRoot(rootNodeElement);
root.render(<RootComponent />);