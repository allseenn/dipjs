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
    res.send(`
<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ODROID: WEB-MET</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .card-body {
        display: flex;
        flex-direction: column;
        justify-content: center;  
        align-items: center;      
        height: 100%;            
        }

        .card-text {
            margin: 0;               
        }
        .card {
            cursor: grab;
            user-select: none;
        }
        .card.dragging {
            opacity: 0.5;
        }
        .grid-container {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
    </style>
    <script>
        let draggedElement = null;

        function enableDragAndDrop() {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                card.setAttribute('draggable', true);

                card.addEventListener('dragstart', (event) => {
                    draggedElement = card;
                    card.classList.add('dragging');
                    event.dataTransfer.setData('text/plain', card.id);
                });

                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                });
            });

            const container = document.querySelector('.grid-container');
            container.addEventListener('dragover', (event) => {
                event.preventDefault();
                const afterElement = getDragAfterElement(container, event.clientY);
                if (afterElement == null) {
                    container.appendChild(draggedElement);
                } else {
                    container.insertBefore(draggedElement, afterElement);
                }
            });
        }

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        document.addEventListener('DOMContentLoaded', () => {
            enableDragAndDrop();
        });

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

        async function fetchWeather() {
        try {
            const response = await fetch('https://wttr.in/Moscow?format=%t+%h');
            const weather = await response.text(); // Получаем текстовую информацию о погоде
            document.getElementById('weather-temp').textContent = weather.split(' ')[0].replace('°C', '');
            document.getElementById('weather-hum').textContent = weather.split(' ')[1].replace('%', '');
        } catch (error) {
            console.error('Error fetching weather data:', error);
            document.getElementById('weather-temp').textContent = 'N/A';
        }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
    setInterval(fetchWeather, 900000); // обновление каждые 15 минут
});

    </script>
</head>
<body onload="updateData()" class="bg-light">
    <div class="container my-4">
        <h1 class="text-center mb-4">ODROID: WEB-MET</h1>
        <div class="grid-container">
            <div class="card text-center" id="card1">
                <div class="card-body">
                    <h5 class="card-title">Температура воздуха</h5>
                    <p class="card-text display-5" id="temp">--</p>
                    <p class="text-muted">°C</p>
                </div>
            </div>
            <div class="card text-center" id="card2">
                <div class="card-body">
                    <h5 class="card-title">Некомпенсированная температура воздуха</h5>
                    <p class="card-text display-5" id="raw_temp">--</p>
                    <p class="text-muted">°C</p>
                </div>
            </div>
            <div class="card text-center" id="card3">
                <div class="card-body">
                    <h5 class="card-title">Относительная влажность воздуха</h5>
                    <p class="card-text display-5" id="humidity">--</p>
                    <p class="text-muted">%</p>
                </div>
            </div>
            <div class="card text-center" id="card4">
                <div class="card-body">
                    <h5 class="card-title">Некомпенсированная влажность воздуха</h5>
                    <p class="card-text display-5" id="raw_hum">--</p>
                    <p class="text-muted">%</p>
                </div>
            </div>
            <div class="card text-center" id="card5">
                <div class="card-body">
                    <h5 class="card-title">Атмосферное давление</h5>
                    <p class="card-text display-5" id="press">--</p>
                    <p class="text-muted">mmHg</p>
                </div>
            </div>
            <div class="card text-center" id="card6">
                <div class="card-body">
                    <h5 class="card-title">Электрическое сопротивление воздуха</h5>
                    <p class="card-text display-5" id="gas">--</p>
                    <p class="text-muted">K&ohm;</p>
                </div>
            </div>
            <div class="card text-center" id="card7">
                <div class="card-body">
                    <h5 class="card-title">Эквивалентная концентрация CO<sub>2</sub> в воздух</h5>
                    <p class="card-text display-5" id="ecCO2">--</p>
                    <p class="text-muted">ppm</p>
                </div>
            </div>
            <div class="card text-center" id="card8">
                <div class="card-body">
                    <h5 class="card-title">Концентрация летучих органических веществ</h5>
                    <p class="card-text display-5" id="bVOC">--</p>
                    <p class="text-muted">ppm</p>
                </div>
            </div>
            <div class="card text-center" id="card9">
                <div class="card-body">
                    <h5 class="card-title">Динамический индекс качества воздуха</h5>
                    <p class="card-text display-5" id="IAQ">--</p>
                    <p class="text-muted">D-IAQ</p>
                </div>
            </div>
            <div class="card text-center" id="card10">
                <div class="card-body">
                    <h5 class="card-title">Статический индекс качества воздуха</h5>
                    <p class="card-text display-5" id="SIAQ">--</p>
                    <p class="text-muted">S-IAQ</p>
                </div>
            </div>
            <div class="card text-center" id="card11">
                <div class="card-body">
                    <h5 class="card-title">Точность индекса качества воздуха</h5>
                    <p class="card-text display-5" id="IAQ_ACC">--</p>
                    <p class="text-muted">QoS</p>
                </div>
            </div>
            <div class="card text-center" id="card12">
                <div class="card-body">
                    <h5 class="card-title">Ошибки работы воздушного датчика</h5>
                    <p class="card-text display-5" id="status">--</p>
                    <p class="text-muted">CODE</p>
                </div>
            </div>
            <div class="card text-center" id="card13">
                <div class="card-body">
                    <h5 class="card-title">Динамический уровень радиации</h5>
                    <p class="card-text display-5" id="rad_dyn">--</p>
                    <p class="text-muted">μR/h</p>
                </div>
            </div>
            <div class="card text-center" id="card14">
                <div class="card-body">
                    <h5 class="card-title">Статический уровень радиации</h5>
                    <p class="card-text display-5" id="rad_stat">--</p>
                    <p class="text-muted">μR/h</p>
                </div>
            </div>
                <div class="card text-center" id="weather-card">
                <div class="card-body">
                    <h5 class="card-title">Температура на улице</h5>
                    <p class="card-text display-5" id="weather-temp">--</p>
                    <p class="text-muted" id="weather-time">°C</p>
                </div>
            </div>
                <div class="card text-center" id="weather-card">
                <div class="card-body">
                    <h5 class="card-title">Влажность на улице</h5>
                    <p class="card-text display-5" id="weather-hum">--</p>
                    <p class="text-muted" id="weather-time">%</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`);
});

app.listen(port, () => {
    console.log(`Server running at http://192.168.1.42:${port}`);
});
