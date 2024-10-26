const API_KEY = 'yzBsAVX_-iLH1pqlrromVsNAJkZP42CvlMAmhNiZWdc';

let map, ui;

function initializeMap(latitude, longitude) {
  const platform = new H.service.Platform({
    apikey: API_KEY
  });
  const defaultLayers = platform.createDefaultLayers();

  map = new H.Map(document.getElementById('map'), defaultLayers.vector.normal.map, {
    center: { lat: latitude, lng: longitude },
    zoom: 15,
    pixelRatio: window.devicePixelRatio || 1
  });

  ui = H.ui.UI.createDefault(map, defaultLayers);
  window.addEventListener('resize', () => map.getViewPort().resize());

  const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

  // Marcador para a localização do usuário
  const userMarker = new H.map.Marker({ lat: latitude, lng: longitude });
  map.addObject(userMarker);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendLocation, showError);
  } else {
    alert("Geolocalização não é suportada neste navegador.");
  }
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("Permissão negada pelo usuário.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Localização indisponível.");
      break;
    case error.TIMEOUT:
      alert("A solicitação expirou.");
      break;
    case error.UNKNOWN_ERROR:
      alert("Erro desconhecido.");
      break;
  }
}

async function sendLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const categories = ['restaurant', 'hospital', 'pharmacy', 'ong'];

  initializeMap(latitude, longitude);

  try {
    const response = await fetch('http://localhost:3000/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude, longitude, categories })
    });

    const places = await response.json();
    console.log("Locais retornados:", places); // Log para verificar os dados retornados
    displayResults(places);
    addMarkersToMap(places);
  } catch (error) {
    console.error('Erro ao enviar localização:', error);
  }
}

function displayResults(places) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<h2>Resultados:</h2>';
  if (places.length > 0) {
    places.forEach((place, index) => {
      resultsDiv.innerHTML += `<p>${index + 1}. ${place.title} - ${place.address.label} - ${place.distance}m</p>`;
    });
  } else {
    resultsDiv.innerHTML += '<p>Nenhum resultado encontrado.</p>';
  }
}

// Função para adicionar marcadores básicos ao mapa
function addMarkersToMap(places) {
  places.forEach(place => {
    const marker = new H.map.Marker({
      lat: place.position.lat,
      lng: place.position.lng
    });

    // Adiciona um balão de informações ao clicar no marcador
    marker.setData(`<b>${place.title}</b><br>${place.address.label}`);
    marker.addEventListener('tap', function (evt) {
      const bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
        content: evt.target.getData()
      });
      ui.addBubble(bubble);
    });
    
    map.addObject(marker);
  });
}
