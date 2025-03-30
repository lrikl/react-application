'use strict';

import React, { useState, useEffect, useRef } from 'react';

import "./timer.scss";

export default () => {
    const timeRegx = /^([0-5][0-9]):([0-5][0-9])$/;

    const [inputValue, setInputValue] = useState('00:00');
    const [showResults, setShowResults] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const [showLabel, setShowLabel] = useState(true);
    const [timerError, setTimerError] = useState('');
    const [timerMinute, setTimerMinute] = useState(0);
    const [timerSeconde, setTimerSeconde] = useState(0);
    
    const countDownInterval = useRef(null);
    const audioRef = useRef(null);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    function startCountDown() {
        setShowResults(false);

        if (!timeRegx.test(inputValue)) {
            setTimerError('Формат таймера невірний, напишіть кількість хвилин або секунд від 00 до 59, виду 01:25');
            return;
        } 

        if (inputValue === '00:00') {
            setTimerError('Введіть значення більше 0');
            return;
        }

        setTimerError('');

        if (countDownInterval.current) {
            clearInterval(countDownInterval.current);
            countDownInterval.current = null;
        }
        
        const [minute, sec] = inputValue.split(':').map(Number);
        setTimerMinute(minute);
        setTimerSeconde(sec);
        setShowTimer(true);
        setShowLabel(false);
        setInputValue("00:00");

        countDownInterval.current = setInterval(() => {
            setTimerSeconde((prevSec) => {
                if (prevSec > 0) {
                    return prevSec - 1;
                } else {
                    setTimerMinute((prevMin) => {
                        if (prevMin > 0) {
                            setTimerSeconde(59);
                            return prevMin - 1;
                        } else {
                            clearInterval(countDownInterval.current);
                            countDownInterval.current = null;
                            setShowResults(true);
                            setShowTimer(false);
                            return 0;
                        }
                    });
                    return 0;
                }
            });
        }, 1000);
    }

    useEffect(() => {
        if (showResults && audioRef.current) {
            audioRef.current.play();
        } else if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [showResults]);

    useEffect(() => {
        return () => {
            if (countDownInterval.current) {
                clearInterval(countDownInterval.current);
                countDownInterval.current = null;
            }
        };
    }, []);

    return (
        <div className='timer-container'>
            <h2>Таймер відліку</h2>
            <div className="timer-block">
                <div className="timer-controls">
                    {showLabel && (
                        <label className="timer-controls__label" htmlFor="timer-input">
                            Введіть таймер відліку у форматі 00:00
                        </label>
                    )}
                    <input 
                        id="timer-input" 
                        className="timer-controls__input" 
                        type="text" 
                        name="timer" 
                        value={inputValue}
                        onChange={handleChange}
                    />
                    {timerError && <div className="error-message">{timerError}</div>}
                    <button className="timer-controls__button timer-button" type="button" onClick={startCountDown}>
                        Почати
                    </button>
                </div>

                {showTimer && (
                    <div className="timer">
                        {String(timerMinute).padStart(2, '0')}:{String(timerSeconde).padStart(2, '0')}
                    </div>
                )}

                {showResults && (
                    <div className="timer-end">
                        <div className="timer-end__title">Відлік завершено! 🎉</div>
                        <div className="timer-end__img"><img src="./static//gif/giphy.gif" alt="gif"/></div>
                        <audio ref={audioRef} className="end-sound" src="./static//audio/alarm.mp3" preload="auto"></audio>
                    </div>
                )}
            </div>
        </div>
    );
};