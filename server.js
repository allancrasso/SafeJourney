const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const API_KEY = 'yzBsAVX_-iLH1pqlrromVsNAJkZP42CvlMAmhNiZWdc';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Função para buscar locais para cada tipo de categoria
async function fetchPlacesByCategory(latitude, longitude, category) {
  const url = `https://discover.search.hereapi.com/v1/discover?at=${latitude},${longitude}&q=${category}&limit=5&apikey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.items || [];
}

// Endpoint para buscar locais para várias categorias
app.post('/nearby', async (req, res) => {
  const { latitude, longitude, categories } = req.body;

  try {
    const results = await Promise.all(
      categories.map(category => fetchPlacesByCategory(latitude, longitude, category))
    );

    // Mescla todos os resultados em um único array
    const allPlaces = results.flat();
    res.json(allPlaces);
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    res.status(500).json({ error: 'Erro ao buscar locais' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
