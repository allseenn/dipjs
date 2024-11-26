const express = require('express');
const redis = require('redis');

const app = express();
const PORT = 1080;

// Подключение к локальному Redis
const client = redis.createClient();

let latestData = '';

// Следим за изменениями в Redis и обновляем данные
client.on('message', (channel, message) => {
    latestData = message;
});

client.subscribe('dataChannel');

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Данные из Redis</title></head>
            <body>
                <h1>Данные из Redis:</h1>
                <pre>${latestData}</pre>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
