import React, { useState, useEffect } from "react";
import Earth from "./Earth";

const API_KEY = "25bb2d9e9b9884e8cf4d3a4f98f55c56";

const App = () => {
  const [city, setCity] = useState("Bogotá");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [daysToShow, setDaysToShow] = useState(3);
  const [background, setBackground] = useState("bg-gradient-to-br from-blue-600 to-indigo-800 text-white");
  const [localTime, setLocalTime] = useState("");

  // NUEVO: Estado para coordenadas
  const [coordinates, setCoordinates] = useState(null);

  const fetchWeatherData = async (city) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`
      );
      const data = await res.json();
      if (data.cod !== 200) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const fetchForecast = async (city) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`
      );
      const data = await res.json();
      if (data.cod !== "200") throw new Error(data.message);

      const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
      return dailyData.slice(0, 5);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleSearch = async () => {
    const weatherData = await fetchWeatherData(city);
    const forecastData = await fetchForecast(city);
    setWeather(weatherData);
    setForecast(forecastData);

    // NUEVO: Guardar coordenadas
    if (weatherData?.coord) {
      setCoordinates({ lat: weatherData.coord.lat, lon: weatherData.coord.lon });
    }
  };

  useEffect(() => {
    if (!weather) return;

    const updateTime = () => {
      const utcTime = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const local = new Date(utcTime + weather.timezone * 1000);
      setLocalTime(local.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));

      const hour = local.getHours();
      if (hour >= 6 && hour < 18) {
        setBackground("bg-gradient-to-br from-blue-400 to-blue-700 text-black");
      } else {
        setBackground("bg-gradient-to-br from-gray-800 to-black text-white");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [weather]);

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700 ${background}`}>
      <h1 className="text-3xl font-bold mb-4">Clima Actual</h1>
      
        <div className="flex flex-col sm:flex-row gap-2 mb-6 w-full max-w-md">
        <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ingresa ciudad"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-2 rounded-lg text-black"
        />
        <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
            Buscar
        </button>
        </div>

      {/* NUEVO: Mostrar globo terráqueo */}
      <Earth coordinates={coordinates} />

      {weather && (
        <div className="bg-black bg-opacity-30 p-6 rounded-2xl text-center shadow-lg animate-fadeIn">
          <h2 className="text-2xl font-semibold">{weather.name}</h2>
          <p className="text-lg capitalize">{weather.weather[0].description}</p>
          <p className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</p>
          <p className="mt-2 text-sm">Hora local: {localTime}</p>
        </div>
      )}

      {forecast.length > 0 && (
        <>
          <div className="flex justify-center mt-6 gap-4">
            <button
              className={`px-4 py-2 rounded-lg ${daysToShow === 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
              onClick={() => setDaysToShow(3)}
            >
              3 días
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${daysToShow === 5 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
              onClick={() => setDaysToShow(5)}
            >
              5 días
            </button>
          </div>

          <div className="forecast-container mt-6 flex gap-4 justify-center flex-wrap">
            {forecast.slice(0, daysToShow).map((day, index) => (
              <div
                key={index}
                className="forecast-card bg-gray-800 bg-opacity-70 rounded-2xl p-4 text-center w-28 hover:scale-105 transition-transform duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="font-semibold capitalize">
                  {new Date(day.dt_txt).toLocaleDateString('es-ES', { weekday: 'long' })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                  className="mx-auto"
                />
                <p className="text-lg">{Math.round(day.main.temp)}°C</p>
                <p className="text-sm">{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
