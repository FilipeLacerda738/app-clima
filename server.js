const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/weather', async (req, res) => {
    const city = req.query.city;
    const apiKey = process.env.API_KEY;

    if (!city) {
        return res.status(400).json({ error: 'Cidade não fornecida' });
    }

    if (!apiKey) {
        return res.status(500).json({ error: 'Configuração de API Key ausente' });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;
        
        const apiResponse = await fetch(url);
        const data = await apiResponse.json();

        if (data.cod && data.cod !== 200) {
            return res.status(parseInt(data.cod)).json(data);
        }

        res.status(apiResponse.status).json(data);

    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor proxy' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});