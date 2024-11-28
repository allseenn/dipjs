import React, { useEffect, useState } from 'react';
import MetricCard from './components/MetricCard';
import './App.css';
import { createClient } from 'redis';

const App = () => {
    const [metrics, setMetrics] = useState({});
    const [weather, setWeather] = useState({ temp: '--', hum: '--' });
    const redisConfig = {
        socket: {
            host: '127.0.0.1',
            port: 6379,
        },
    };

    useEffect(() => {
        const fetchMetrics = async () => {
            const client = createClient(redisConfig);
            try {
                await client.connect();
                const list = await client.lRange('0', 0, -1);

                const data = {
                    temp: parseFloat(list[0]),
                    raw_temp: parseFloat(list[1]),
                    humidity: parseFloat(list[2]),
                    raw_hum: parseFloat(list[3]),
                    press: parseFloat(list[4]),
                    gas: parseFloat(list[5]),
                    ecCO2: parseFloat(list[6]),
                    bVOC: parseFloat(list[7]),
                    IAQ: parseFloat(list[8]),
                    SIAQ: parseFloat(list[9]),
                    IAQ_ACC: parseInt(list[10], 10),
                    status: parseInt(list[11], 10),
                    rad_dyn: parseFloat(list[12]),
                    rad_stat: parseInt(list[13], 10),
                };

                setMetrics(data);
            } catch (err) {
                console.error('Error connecting to Redis:', err);
            } finally {
                await client.disconnect();
            }
        };

        const fetchWeather = async () => {
            try {
                const response = await fetch('https://wttr.in/Moscow?format=%t+%h');
                const weatherData = await response.text();
                const [temp, hum] = weatherData.split(' ');
                setWeather({
                    temp: temp.replace('°C', ''),
                    hum: hum.replace('%', ''),
                });
            } catch (error) {
                console.error('Error fetching weather data:', error);
                setWeather({ temp: 'N/A', hum: 'N/A' });
            }
        };

        fetchMetrics();
        fetchWeather();
        const metricsInterval = setInterval(fetchMetrics, 3000);
        const weatherInterval = setInterval(fetchWeather, 900000);
        return () => {
            clearInterval(metricsInterval);
            clearInterval(weatherInterval);
        };
    }, []);

    const cards = [
        { id: 'temp', title: 'Температура воздуха', unit: '°C' },
        { id: 'raw_temp', title: 'Некомпенсированная температура', unit: '°C' },
        { id: 'humidity', title: 'Относительная влажность', unit: '%' },
        { id: 'raw_hum', title: 'Некомпенсированная влажность', unit: '%' },
        { id: 'press', title: 'Атмосферное давление', unit: 'mmHg' },
        { id: 'gas', title: 'Электрическое сопротивление воздуха', unit: 'KΩ' },
        { id: 'ecCO2', title: 'Эквивалентный CO₂', unit: 'ppm' },
        { id: 'bVOC', title: 'Летучие органические вещества', unit: 'ppm' },
        { id: 'IAQ', title: 'Динамический индекс качества воздуха', unit: 'D-IAQ' },
        { id: 'SIAQ', title: 'Статический индекс качества воздуха', unit: 'S-IAQ' },
        { id: 'IAQ_ACC', title: 'Точность качества воздуха', unit: 'QoS' },
        { id: 'status', title: 'Ошибки датчика', unit: 'CODE' },
        { id: 'rad_dyn', title: 'Динамическая радиация', unit: 'μR/h' },
        { id: 'rad_stat', title: 'Статическая радиация', unit: 'μR/h' },
    ];

    const weatherCards = [
        { id: 'weather-temp', title: 'Температура на улице', value: weather.temp, unit: '°C' },
        { id: 'weather-hum', title: 'Влажность на улице', value: weather.hum, unit: '%' },
    ];

    return (
        <div className="container my-4">
            <h1 className="text-center mb-4">ODROID: WEB-MET</h1>
            <div className="grid-container">
                {cards.map((card) => (
                    <MetricCard
                        key={card.id}
                        title={card.title}
                        value={metrics[card.id]}
                        unit={card.unit}
                    />
                ))}
                {weatherCards.map((card) => (
                    <MetricCard
                        key={card.id}
                        title={card.title}
                        value={card.value}
                        unit={card.unit}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;
