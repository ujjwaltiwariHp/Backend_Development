const axios = require('axios');
const pool = require('../database/db'); 
require('dotenv').config();

const getWeatherByCity = async (req, res) => {
  const { city } = req.params;
  const API_KEY = process.env.WEATHER_API_KEY;
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = response.data;
    const temperature = data.main.temp;
    const humidity = data.main.humidity;
    const description = data.weather[0].description;

    await pool.query(
      `INSERT INTO weather_data (city, temperature, humidity, description)
       VALUES ($1, $2, $3, $4)`,
      [city, temperature, humidity, description]
    );

    res.status(200).json({
      city,
      temperature,
      humidity,
      description,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Could not fetch weather data' });
  }
};

module.exports = { getWeatherByCity };
