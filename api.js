document.getElementById('getWeatherBtn').addEventListener('click', getWeather);
document.getElementById('convertTempBtn').addEventListener('click', convertTemp);
document.getElementById('getLocationBtn').addEventListener('click', getLocation);

let currentTempF = 0;
let isCelsius = false;
const apiKey = 'f9acd824dab7816e7165a2c185c13d65';

async function getWeather() {
    const zipCode = document.getElementById('zipcode').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;

    let geoResponse, geoData;
    if (zipCode) {
        geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${apiKey}`);
        geoData = await geoResponse.json();
    } else if (city && state) {
        geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&appid=${apiKey}`);
        geoData = await geoResponse.json();
        geoData = geoData[0]; 
    } else {
        alert("Please enter a zip code or city and state.");
        return;
    }

    const lat = geoData.lat;
    const lon = geoData.lon;
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const weatherData = await weatherResponse.json();

    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const forecastDataCache = await forecastResponse.json();

    displayWeather(weatherData, geoData.name);
    displayForecast(forecastDataCache.list, geoData.name);
}

function displayWeather(data, city) {
    const date = new Date().toLocaleDateString();
    currentTempF = data.main.temp;
    const tempHi = data.main.temp_max;
    const tempLo = data.main.temp_min;
    const conditions = data.weather[0].description;
    const feelsLike = data.main.feels_like;
    const humidity = data.main.humidity;

    let weatherClass = '';
    if (conditions.includes('rain')) {
        weatherClass = 'rainy';
    } else if (conditions.includes('cloud')) {
        weatherClass = 'cloudy';
    } else {
        weatherClass = 'sunny';
    }

    document.body.className = weatherClass;

    let weatherIcon = '';
    if (conditions.includes('rain')) {
        weatherIcon = '<i class="fas fa-cloud-showers-heavy"></i>';
    } else if (conditions.includes('cloud')) {
        weatherIcon = '<i class="fas fa-cloud"></i>';
    } else {
        weatherIcon = '<i class="fas fa-sun"></i>';
    }

    document.getElementById('weatherDisplay').innerHTML = `
        <div>${date}</div>
        <div>${city}</div>
        <div>${weatherIcon} ${currentTempF} °F</div>
        <div>${conditions}</div>
        <div>High: ${tempHi} °F</div>
        <div>Low: ${tempLo} °F</div>
        <div>Feels Like: ${feelsLike} °F</div>
        <div>Humidity: ${humidity}%</div>
    `;
}

function convertTemp() {
    if (isCelsius) {
        document.querySelectorAll('.weather-display div:nth-child(3)').forEach(div => {
            div.innerText = `${currentTempF} °F`;
        });
        isCelsius = false;
    } else {
        const tempC = ((currentTempF - 32) * 5 / 9).toFixed(2);
        document.querySelectorAll('.weather-display div:nth-child(3)').forEach(div => {
            div.innerText = `${tempC} °C`;
        });
        isCelsius = true;
    }
}

async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                displayWeather(data, "Your Location");
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function displayForecast(forecastList, city) {
  
}
