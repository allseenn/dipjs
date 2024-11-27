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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
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
<body onload="updateData()" class="bg-light">
    <div class="container my-4">
        <h1 class="text-center mb-4">ODROID: WEB-MET</h1>
        <div class="row g-3">
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Temperature</h5>
                        <p class="card-text display-5" id="temp">--</p>
                        <p class="text-muted">C°</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Raw Temperature</h5>
                        <p class="card-text display-5" id="raw_temp">--</p>
                        <p class="text-muted">C°</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Humidity</h5>
                        <p class="card-text display-5" id="humidity">--</p>
                        <p class="text-muted">%</p>
                    </div>
                </div>
            </div>
            <!-- Дополнительные карточки -->
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Raw Humidity</h5>
                        <p class="card-text display-5" id="raw_hum">--</p>
                        <p class="text-muted">%</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Pressure</h5>
                        <p class="card-text display-5" id="press">--</p>
                        <p class="text-muted">mmHg</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">gas</h5>
                        <p class="card-text display-5" id="gas">--</p>
                        <p class="text-muted">K&ohm;</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">ecCO2</h5>
                        <p class="card-text display-5" id="ecCO2">--</p>
                        <p class="text-muted">ppm</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">bVOC</h5>
                        <p class="card-text display-5" id="bVOC">--</p>
                        <p class="text-muted">ppm</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">IAQ</h5>
                        <p class="card-text display-5" id="IAQ">--</p>
                        <p class="text-muted">IAQ</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">SIAQ</h5>
                        <p class="card-text display-5" id="SIAQ">--</p>
                        <p class="text-muted">SIAQ</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">IAQ_ACC</h5>
                        <p class="card-text display-5" id="IAQ_ACC">--</p>
                        <p class="text-muted">IAQ_ACC</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">status</h5>
                        <p class="card-text display-5" id="status">--</p>
                        <p class="text-muted">status</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">dyn_rad</h5>
                        <p class="card-text display-5" id="dyn_rad">--</p>
                        <p class="text-muted">dyn_rad</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-sm-6">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">stat_rad</h5>
                        <p class="card-text display-5" id="stat_rad">--</p>
                        <p class="text-muted">stat_rad</p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</body>
</html>`);
});

app.listen(port, () => {
    console.log(`Server running at http://192.168.1.42:${port}`);
});
