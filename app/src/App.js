import React, { useState, useEffect } from 'react';
import MetricCard from './components/MetricCard'; // Путь к компоненту MetricCard

const App = () => {
  const [metrics, setMetrics] = useState({});
  const [weatherData, setWeatherData] = useState({
    temp: '--',
    hum: '--',
  });

  // Функция для получения метрик с сервера
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/data');
      const data = await response.json();
      setMetrics(data); // Обновление состояния с полученными данными
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Функция для получения данных о погоде
  const fetchWeather = async () => {
    try {
      const response = await fetch('https://wttr.in/Moscow?format=%t+%h');
      const weather = await response.text();
      const [temp, hum] = weather.split(' ');
      setWeatherData({
        temp: temp.replace('°C', ''),
        hum: hum.replace('%', ''),
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // useEffect для запуска обновлений данных при монтировании компонента
  useEffect(() => {
    fetchMetrics();  // Загружаем метрики при загрузке страницы
    fetchWeather();  // Загружаем данные о погоде

    // Запускаем обновление данных каждые 3 секунды
    const metricsInterval = setInterval(fetchMetrics, 3000);
    const weatherInterval = setInterval(fetchWeather, 900000); // Обновление погодных данных каждые 15 минут

    return () => {
      clearInterval(metricsInterval);  // Очищаем интервал при размонтировании компонента
      clearInterval(weatherInterval);   // Очищаем интервал для погодных данных
    };
  }, []); // Пустой массив зависимостей, чтобы useEffect выполнялся один раз при монтировании

  const cards = [
    { id: 'temp', title: 'Температура воздуха', unit: '°C' },
    { id: 'raw_temp', title: 'Некомпенсированная температура', unit: '°C' },
    { id: 'humidity', title: 'Относительная влажность', unit: '%' },
    { id: 'raw_hum', title: 'Некомпенсированная влажность', unit: '%' },
    { id: 'press', title: 'Атмосферное давление', unit: 'mmHg' },
    { id: 'gas', title: 'Электрическое сопротивление', unit: 'KΩ' },
    { id: 'ecCO2', title: 'Концентрация CO₂', unit: 'ppm' },
    { id: 'bVOC', title: 'Концентрация летучих органических веществ', unit: 'ppm' },
    { id: 'IAQ', title: 'Индекс качества воздуха', unit: 'D-IAQ' },
    { id: 'SIAQ', title: 'Статический индекс качества', unit: 'S-IAQ' },
    { id: 'IAQ_ACC', title: 'Точность индекса качества', unit: 'QoS' },
    { id: 'status', title: 'Ошибки работы датчика', unit: 'CODE' },
    { id: 'rad_dyn', title: 'Динамический уровень радиации', unit: 'μR/h' },
    { id: 'rad_stat', title: 'Статический уровень радиации', unit: 'μR/h' },
  ];

  const weatherCards = [
    { id: 'weather-temp', title: 'Температура на улице', value: weatherData.temp, unit: '°C' },
    { id: 'weather-hum', title: 'Влажность на улице', value: weatherData.hum, unit: '%' },
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
