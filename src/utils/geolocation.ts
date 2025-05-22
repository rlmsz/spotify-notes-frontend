type City = {
  name: string;
  country: string;
  lat: number;
  lon: number;
};

const cities: City[] = [
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "New York", country: "USA", lat: 40.7128, lon: -74.0060 },
  { name: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", country: "Japan", lat: 35.6895, lon: 139.6917 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Toronto", country: "Canada", lat: 43.65107, lon: -79.347015 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  // Add more as needed
];

function getNearestCity(lat: number, lon: number): City | null {
  let nearest: City | null = null;
  let minDistance = Infinity;

  for (const city of cities) {
    const distance = Math.hypot(lat - city.lat, lon - city.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  }

  return nearest;
}

export async function detectUserCity(): Promise<City | null> {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by this browser.");
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const city = getNearestCity(latitude, longitude);
        resolve(city);
      },
      (err) => {
        console.error("Failed to get geolocation:", err.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}
