import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Paper } from '@mui/material';
import './index.css'; // Подключаем стили

const App = () => {
    const [metrics, setMetrics] = useState({});

    // Заполненные массивы диапазонов для каждой карточки
    const cards = [
        {
            id: 'temp',
            title: 'Температура воздуха',
            unit: '°C',
            blue: [0, 10],  // Синий диапазон: 0-10°C
            green: [11, 20], // Зеленый диапазон: 11-20°C
            red: [21, 40],   // Красный диапазон: 21-40°C
        },
        {
            id: 'humidity',
            title: 'Влажность воздуха',
            unit: '%',
            blue: [0, 30],   // Синий диапазон: 0-30%
            green: [31, 60],  // Зеленый диапазон: 31-60%
            red: [61, 100],   // Красный диапазон: 61-100%
        },
        {
            id: 'pressure',
            title: 'Атмосферное давление',
            unit: 'mmHg',
            blue: [700, 750], // Синий диапазон: 700-750 mmHg
            green: [751, 800], // Зеленый диапазон: 751-800 mmHg
            red: [801, 850],   // Красный диапазон: 801-850 mmHg
        },
        {
            id: 'gas',
            title: 'Электрическое сопротивление воздуха',
            unit: 'KΩ',
            blue: [0, 5],     // Синий диапазон: 0-5 KΩ
            green: [6, 15],    // Зеленый диапазон: 6-15 KΩ
            red: [16, 30],     // Красный диапазон: 16-30 KΩ
        },
        {
            id: 'radDyn',
            title: 'Динамический уровень радиации',
            unit: 'μR/h',
            blue: [0, 10],    // Синий диапазон: 0-10 μR/h
            green: [11, 20],   // Зеленый диапазон: 11-20 μR/h
            red: [21, 50],     // Красный диапазон: 21-50 μR/h
        },
    ];

    // Функция для определения цвета в зависимости от диапазона
    const getColor = (value, card) => {
        if (value >= card.blue[0] && value <= card.blue[1]) return 'blue';
        if (value >= card.green[0] && value <= card.green[1]) return 'green';
        if (value >= card.red[0] && value <= card.red[1]) return 'red';
        return 'black'; // Если значение не в диапазоне
    };

    // Пример асинхронной загрузки данных
    useEffect(() => {
        // Здесь мы эмулируем получение данных (например, с сервера)
        const fetchedMetrics = {
            temp: 22, // Пример значения: 22°C
            humidity: 45, // Пример значения: 45%
            pressure: 760, // Пример значения: 760 mmHg
            gas: 12, // Пример значения: 12 KΩ
            radDyn: 15, // Пример значения: 15 μR/h
        };
        setMetrics(fetchedMetrics);
    }, []);

    return (
        <Container maxWidth="lg" className="container my-4">
            <Grid container spacing={3}>
                {cards.map((card) => (
                    <Grid item xs={12} sm={6} md={3} key={card.id}>
                        <Paper className="metric-card" elevation={3}>
                            <Typography variant="h6" align="center" className="card-title">
                                {card.title}
                            </Typography>
                            <Typography
                                variant="h4"
                                align="center"
                                className="card-value"
                                sx={{
                                    color: (theme) => {
                                        const value = metrics[card.id];
                                        return value !== undefined ? getColor(value, card) : 'black';
                                    },
                                }}
                            >
                                {metrics[card.id] ?? '--'}
                            </Typography>
                            <Typography variant="body2" align="center" className="card-unit">
                                {card.unit}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default App;
