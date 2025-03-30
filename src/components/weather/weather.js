'use strict';

import React, { useState, useEffect } from 'react';

import "./weather.scss";

export default () => {
    const apiKey = 'fb739f60510f087a4d8a414456cb1ea7';

    const [currentCity, setCurrentCity] = useState(getCityFromStorage());
    const [weatherIcon, setWeatherIcon] = useState('');
    const [temperatureElement, setTemperatureElement] = useState('');
    const [temperatureFeels, setTemperatureFeels] = useState('');
    const [descriptionElement, setDescriptionElement] = useState('');
    const [humidityElement, setHumidityElement] = useState('');
    const [windElement, setWindElement] = useState('');
    const [pressureElement, setPressureElement] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [lastUpdate, setLastUpdate] = useState('');
    const [showLastUpdate, setShowLastUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    async function updateWeather() {
        try {
            setHasError(false);
            setIsLoading(true);

            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${apiKey}&units=metric&lang=ua`;
            const response = await fetch(apiUrl);
           
      
            if (!response.ok) {
                throw new Error(`HTTP помилка! Статус: ${response.status}`);
            }
      
            const data = await response.json();

            setWeatherIcon(`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
            setTemperatureElement(`${parseInt(data.main.temp)}`);
            setTemperatureFeels(`${parseInt(data.main.feels_like)}`);
            setDescriptionElement(data.weather[0].description);
            setHumidityElement(data.main.humidity);
            setWindElement(data.wind.speed);
            setPressureElement(data.main.pressure);
    
            setIsLoading(false);
            
        } catch(error) {
            console.error(error);
            setHasError(true);
        }
    }

    function getCityFromStorage() {
        return JSON.parse(localStorage.getItem('myCityWeather')) || 'Odesa';
    }
      
    function saveCityInStorage(city) {
        localStorage.setItem('myCityWeather', JSON.stringify(city));
    }
    
    const handleCityChange = (event) => {
        const newCity = event.target.value;
        setCurrentCity(newCity);
        saveCityInStorage(newCity);
    };

    function getCurrentTime() {
        const now = new Date();
        const [hours, minute, sec] = now.toLocaleTimeString('uk-UA', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).split(':');
        return { hours, minute, sec };
    }

    function updateCurrentTime() {
        const { hours, minute, sec } = getCurrentTime();
        setCurrentTime(`${hours}:${minute}:${sec}`);
    }

    function getCurrentDay() {
        const now = new Date();
        const options = { weekday: 'short', month: 'long', day: 'numeric' };
        const formattedDate = now.toLocaleDateString('uk-UA', options);
        return formattedDate;
    }

    async function refreshWeather() {
        await updateWeather();

        const { hours, minute } = getCurrentTime();
        setLastUpdate(`${hours}:${minute}`);

        setShowLastUpdate(true);
        setTimeout(() => {
            setShowLastUpdate(false);
        }, 2000);
    }
    
    useEffect(() => {
        updateWeather();
    }, [currentCity]);
    
    useEffect(() => {
        updateCurrentTime();
        setCurrentDay(getCurrentDay());

        const interval = setInterval(updateCurrentTime, 1000); 
        return () => clearInterval(interval);
    }, []); 

    return (
        <div className='weather-widget-wrap'>

            <div className="weather-widget" id="weatherWidget">

                <div className="head-weather">
                    <h2 className='weather-title'>Погода</h2>

                    <select id="cities" 
                        value={currentCity}
                        onChange={handleCityChange}
                    >
                        <option value="Kyiv">Київ</option>
                        <option value="test">Тест на помилку</option>
                        <option value="Kharkiv">Харків</option>
                        <option value="Odesa">Одеса</option>
                        <option value="Dnipro">Дніпро</option>
                        <option value="Donetsk">Донецьк</option>
                        <option value="Zaporizhzhia">Запоріжжя</option>
                        <option value="Lviv">Львів</option>
                        <option value="Kryvyi Rih">Кривий Ріг</option>
                        <option value="Mykolaiv">Миколаїв</option>
                        <option value="Luhansk">Луганськ</option>
                        <option value="Sevastopol">Севастополь</option>
                        <option value="Chernihiv">Чернігів</option>
                        <option value="Sumy">Суми</option>
                        <option value="Lutsk">Луцьк</option>
                        <option value="Poltava">Полтава</option>
                        <option value="Vinnytsia">Вінниця</option>
                        <option value="Zhytomyr">Житомир</option>
                        <option value="Khmelnytskyi">Хмельницький</option>
                        <option value="Cherkasy">Черкаси</option>
                        <option value="Rivne">Рівне</option>
                        <option value="Ternopil">Тернопіль</option>
                        <option value="Ivano-Frankivsk">Івано-Франківськ</option>
                        <option value="Kremenchuk">Кременчук</option>
                        <option value="Uzhhorod">Ужгород</option>
                        <option value="Melitopol">Мелітополь</option>
                        <option value="Brovary">Бровари</option>
                        <option value="Balakliya">Балаклія</option>
                        <option value="Berdyansk">Бердянськ</option>
                        <option value="Kostopil">Костопіль</option>
                    </select>

                    <div className="time"><span className="current-day">{currentDay}</span> | <span className="current-time">{currentTime}</span></div>
                </div>
                {isLoading ? (
                    <div className='loader'></div>
                ) : (
                    <div className="main-weather">
                        <div className="first-weather">
                            <div id="weather-icon">{weatherIcon && <img src={weatherIcon} alt="Погода" />}</div>
                            <div className="first-weather-text">
                                <div className="temperature-wrap">
                                    <div id="weather-temperature">{temperatureElement}°C</div>
                                    <div id="feels-temperature">відчувається: {temperatureFeels}°C</div>
                                </div>
                                <div id="weather-description">{descriptionElement}</div>
                            </div>
                        </div>
                        
                        <div className="secondary-weather">
                            <div id="wind" className="secondary-weather-item">
                                <div>Вітер:</div> 
                                <div>{windElement} м/с</div>
                            </div>

                            <div id="humidity" className="secondary-weather-item">
                                <div>Вологість:</div> 
                                <div>{humidityElement} %</div>
                            </div>

                            <div id="pressure" className="secondary-weather-item">
                                <div>Тиск:</div> 
                                <div>{pressureElement} гПа</div>
                            </div>
                        </div>
                    </div>
                    ) 
                }

                <button className='weather-btn' id="update-btn" onClick={refreshWeather}>Оновити погоду</button>
                {showLastUpdate && <div id="last-update">останнє оновлення: {lastUpdate}</div>}

                {hasError && <div className='error'>Помилка при оновленні даних!</div>}
            </div>
        </div>
    );
}
