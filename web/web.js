const express = require('express');
const redis = require('redis');

const app = express();
const port = 3000;

// Создаем подключение к локальному Redis
const client = redis.createClient();
client.connect().catch(console.error);

// Endpoint для получения данных из Redis
app.get('/data', async (req, res) => {
    try {
        // Получаем элементы списка под ключом "0"
        const list = await client.lRange('0', 0, -1);

        // Преобразуем данные в числа перед возвратом
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
            rad_stat: parseInt(list[13], 10)
        };

        // Возвращаем данные в формате JSON
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

// Статический HTML контент
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ODROID: WEB-MET</title>
    <style>
        .metrics {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
        }
    </style>
    <script>
        function updateData() {
            fetch('/data')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('temp').textContent = data.temp.toFixed(1);
                    document.getElementById('raw_temp').textContent = data.raw_temp.toFixed(1);
                    document.getElementById('humidity').textContent = data.humidity.toFixed(1);
                    document.getElementById('raw_hum').textContent = data.raw_hum.toFixed(1);
                    document.getElementById('press').textContent = data.press.toFixed(0);
                    document.getElementById('gas').textContent = data.gas.toFixed(0);
                    document.getElementById('ecCO2').textContent = data.ecCO2.toFixed(0);
                    document.getElementById('bVOC').textContent = data.bVOC.toFixed(2);
                    document.getElementById('IAQ').textContent = data.IAQ.toFixed(0);
                    document.getElementById('SIAQ').textContent = data.SIAQ.toFixed(0);
                    document.getElementById('IAQ_ACC').textContent = data.IAQ_ACC.toFixed(0);
                    document.getElementById('status').textContent = data.status.toFixed(0);
                    document.getElementById('rad_dyn').textContent = data.rad_dyn.toFixed(1);
                    document.getElementById('rad_stat').textContent = data.rad_stat.toFixed(0);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
        setInterval(updateData, 3000);
    </script>
</head>
<body onload="updateData()">
    <h1>ODROID: WEB-MET</h1>
    <section class="metrics">
        <div class="temp">&#127777;
            <p id="temp"></p> C&deg;
        </div>
        <div class="raw_temp">&#127777;<sub>raw</sub>
            <p id="raw_temp"></p> C&deg;
        </div>
        <div class="humidity">&#128167;
            <p id="humidity"></p> &percnt;
        </div>
        <div class="raw_hum">&#128167;<sub>raw</sub>
            <p id="raw_hum"></p> &percnt;
        </div>
        <div class="press">&#128137;
            <p id="press"></p> mmHg
        </div>
        <div class="gas">&#128067;
            <p id="gas"></p> K&ohm;
        </div>
        <div class="ecCO2">CO<sub>2</sub>
            <p id="ecCO2"></p> ppm
        </div>
        <div class="bVOC">VOC
            <p id="bVOC"></p> ppm
        </div>
        <div class="IAQ">&#128663;
            <p id="IAQ"></p> IAQ
        </div>
        <div class="SIAQ">&#127968;
            <p id="SIAQ"></p> S-IAQ
        </div>
        <div class="IAQ_ACC">&#9878;
            <p id="IAQ_ACC"></p>QoS
        </div>
        <div class="status">&#128681;
            <p id="status"></p> ERR
        </div>
        <div class="rad_dyn">&#9762;&#128663;
            <p id="rad_dyn"></p> &mu;R/h
        </div>
        <div class="rad_stat">&#9762;&#127968;
            <p id="rad_stat"></p> &mu;R/h
        </div>
    </section>
</body>
</html>`);
});

app.listen(port, () => {
    console.log(`Server running at http://192.168.1.42:${port}`);
});
