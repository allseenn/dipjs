const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 8080;
const namedPipePath = '/tmp/bsec';

let latestData = '';

// Следим за изменениями в файле и обновляем данные
fs.watch(namedPipePath, () => {
    const readStream = fs.createReadStream(namedPipePath, { encoding: 'utf8' });
    readStream.on('data', (chunk) => {
        latestData = chunk;
    });
    readStream.close();
});

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Данные из канала</title></head>
            <body>
                <h1>Данные из канала:</h1>
                <pre>${latestData}</pre>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
