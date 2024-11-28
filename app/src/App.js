import React, { useState, useEffect } from 'react';
import MetricCard from './components/MetricCard';
import './index.css';

const App = () => {
    const [metrics, setMetrics] = useState({});
    const weatherCards = [
        { id: 'weatherTemp', title: 'Температура на улице', unit: '°C' },
        { id: 'weatherHum', title: 'Влажность на улице', unit: '%' },
    ];

    // Функция для загрузки метрик с сервера
    const fetchData = async () => {
        try {
            const response = await fetch('/api/data');
            if (response.ok) {
                const data = await response.json();
                setMetrics((prevMetrics) => ({
                    ...prevMetrics,
                    ...data,  // Обновляем метрики
                }));
            } else {
                console.error('Error fetching metrics: ', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };

    // Функция для загрузки данных о погоде
    const fetchWeather = async () => {
        try {
            const response = await fetch('https://wttr.in/Moscow?format=%t+%h');
            const weather = await response.text();
            const newWeather = {
                weatherTemp: parseFloat(weather.split(' ')[0].replace('°C', '')),
                weatherHum: parseFloat(weather.split(' ')[1].replace('%', '')),
            };

            // Обновляем только погоду, если данные о погоде изменились
            setMetrics((prevMetrics) => ({
                ...prevMetrics,
                ...newWeather,
            }));
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    // Загружаем данные из API и погоду
    useEffect(() => {
        fetchData();
        fetchWeather();

        const interval = setInterval(() => {
            fetchData();
            fetchWeather();
        }, 3000); // обновление каждые 3 секунды

        return () => clearInterval(interval); // очистка интервала
    }, []);

    // Массив метрик
    const cards = [
        { id: 'temp', title: 'Температура воздуха', unit: '°C' },
        { id: 'raw_temp', title: 'Некомпенсированная температура воздуха', unit: '°C' },
        { id: 'humidity', title: 'Относительная влажность воздуха', unit: '%' },
        { id: 'raw_hum', title: 'Некомпенсированная влажность воздуха', unit: '%' },
        { id: 'press', title: 'Атмосферное давление', unit: 'mmHg' },
        { id: 'gas', title: 'Электрическое сопротивление воздуха', unit: 'KΩ' },
        { id: 'ecCO2', title: 'Эквивалентная концентрация CO₂', unit: 'ppm' },
        { id: 'bVOC', title: 'Концентрация ЛОВ', unit: 'ppm' },
        { id: 'IAQ', title: 'Динамический индекс качества воздуха', unit: 'D-IAQ' },
        { id: 'SIAQ', title: 'Статический индекс качества воздуха', unit: 'S-IAQ' },
        { id: 'IAQ_ACC', title: 'Точность индекса качества воздуха', unit: 'QoS' },
        { id: 'status', title: 'Ошибки работы датчика', unit: 'CODE' },
        { id: 'rad_dyn', title: 'Динамический уровень радиации', unit: 'μR/h' },
        { id: 'rad_stat', title: 'Статический уровень радиации', unit: 'μR/h' },
    ];

    return (
        <div className="container my-4">
            <h1 className="text-center mb-4">ODROID: WEB-MET</h1>
            <div className="grid-container">
                {cards.map((card) => (
                    <MetricCard
                        key={card.id}
                        title={card.title}
                        value={metrics[card.id] || '--'}  {/* Показываем значение или прочерк, если нет */}
                        unit={card.unit}
                    />
                ))}
                {weatherCards.map((card) => (
                    <MetricCard
                        key={card.id}
                        title={card.title}
                        value={metrics[card.id] || '--'}  {/* Показываем значение или прочерк, если нет */}
                        unit={card.unit}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;
