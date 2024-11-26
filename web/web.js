const express = require('express');
const redis = require('redis');

const app = express();
const port = 3000;

// Создаем подключение к локальному Redis
const client = redis.createClient();
client.connect().catch(console.error);

// Ключи для чтения из Redis
const keys = [
    'temperature',
    'raw_temperature',
    'humidity',
    'raw_humidity',
    'pressure',
    'gas',
    'co2_equivalent',
    'breath_voc_equivalent',
    'iaq',
    'static_iaq',
    'iaq_accuracy',
    'bsec_status',
    'dyn_rad',
    'stat_rad'
];

// Endpoint для получения данных из Redis
app.get('/data', async (req, res) => {
    try {
        const data = {};
        for (const key of keys) {
            data[key] = parseFloat(await client.get(key)) || 0;
        }

        res.json({
            temp: data.temperature,
            raw_temp: data.raw_temperature,
            humidity: data.humidity,
            raw_hum: data.raw_humidity,
            press: data.pressure,
            gas: data.gas,
            ecCO2: data.co2_equivalent,
            bVOC: data.breath_voc_equivalent,
            IAQ: data.iaq,
            SIAQ: data.static_iaq,
            IAQ_ACC: data.iaq_accuracy,
            status: data.bsec_status,
            dyn_rad: data.dyn_rad,
            stat_rad: data.stat_rad
        });
    } catch (err) {
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
                    document.getElementById('dyn_rad').textContent = data.dyn_rad;
                    document.getElementById('stat_rad').textContent = data.stat_rad;
                });
        }
        setInterval(updateData, 3000);
    </script>
</head>
<body onload="updateData()">
    <h1>ODROID: WEB-MET</h1>
    <section class="metrics">
    <div class="temp">&#127777;
        <p id="temp"></p>
        C&deg;
    </div>
    <div class="raw_temp">&#127777;<sub>raw</sub>
        <p id="raw_temp"></p>
        C&deg;
    </div>
    <div class="humidity">&#128167;
        <p id="humidity"></p>
        &percnt;
    </div>
    <div class="raw_hum">&#128167;<sub>raw</sub>
        <p id="raw_hum"></p>
        &percnt;
    </div>
    <div class="press">&#128137;
        <p id="press"></p>
        mmHg
    </div>
    <div class="gas">&#128067;
        <p id="gas"></p>
        K&ohm;
    </div>
    <div class="ecCO2">CO<sub>2</sub>
        <p id="ecCO2"></p>
        ppm
    </div>
    <div class="bVOC">VOC
        <p id="bVOC"></p>
        ppm
    </div>
    <div class="IAQ">&#128663;<sub>IAQ</sub>
        <p id="IAQ"></p>
        int
    </div>
    <div class="SIAQ">&#127968;<sub>IAQ</sub>
        <p id="SIAQ"></p>
        int
    </div>
    <div class="IAQ_ACC">&#9878;<sub>IAQ</sub>
        <p id="IAQ_ACC"></p>
        int
    </div>
    <div class="status">&#128681;
        <p id="status"></p>
        int
    </div>
    <div class="dyn_rad">&#9762;&#128663;
        <p id="dyn_rad"></p>
        &mu;R/h
    </div>
    <div class="stat_rad">&#9762;&#127968;
        <p id="stat_rad"></p>
        &mu;R/h
    </div>
    </section>
</body>
</html>`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
