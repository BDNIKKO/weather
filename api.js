document.getElementById('zip-code-btn').addEventListener('click', getWeatherByZip);
document.getElementById('city-state-btn').addEventListener('click', getWeatherByCityState);
document.getElementById('geo-btn').addEventListener('click', getWeatherByGeo);
document.getElementById('convert-temp').addEventListener('click', convertTemperature);

let currentTempF = 0;
let isCelsius = false;
const apiKey = 'f9acd824dab7816e7165a2c185c13d65';

async function getWeatherByZip() {
    const zipCode = document.getElementById('zip-code').value;
    if (zipCode) {
        const geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${apiKey}`);
        const geoData = await geoResponse.json();
        getWeatherData(geoData.lat, geoData.lon, geoData.name);
    } else {
        alert("Please enter a zip code.");
    }
}

async function getWeatherByCityState() {
    const cityState = document.getElementById('city-state').value;
    if (cityState) {
        const [city, state] = cityState.split(',').map(item => item.trim());
        const geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&appid=${apiKey}`);
        const geoData = await geoResponse.json();
        getWeatherData(geoData[0].lat, geoData[0].lon, geoData[0].name);
    } else {
        alert("Please enter a city and state.");
    }
}

async function getWeatherByGeo() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherData(lat, lon, "Your Location");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function getWeatherData(lat, lon, city) {
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const weatherData = await weatherResponse.json();
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const forecastDataCache = await forecastResponse.json();
    displayWeather(weatherData, city);
    displayForecast(forecastDataCache.list);
}

function displayWeather(data, city) {
    const date = new Date().toLocaleDateString();
    currentTempF = data.main.temp;
    const tempHi = data.main.temp_max;
    const tempLo = data.main.temp_min;
    const conditions = data.weather[0].description;
    const weatherIcon = getWeatherIcon(conditions);

    document.getElementById('current-date').textContent = date;
    document.getElementById('city').textContent = city;
    document.getElementById('temperature').innerHTML = `<span class="weather-icon">${weatherIcon}</span> ${currentTempF}°F`;
    document.getElementById('conditions').textContent = conditions;
    document.getElementById('temp-hi-lo').innerHTML = `High: ${tempHi}°F / Low: ${tempLo}°F`;

    // Ensure only one weather icon element is updated
    const weatherIconElement = document.querySelector('.weather-icon');
    weatherIconElement.className = 'weather-icon'; // Reset class
    if (conditions.includes('rain')) {
        weatherIconElement.classList.add('rainy');
    } else if (conditions.includes('cloud')) {
        weatherIconElement.classList.add('cloudy');
    } else {
        weatherIconElement.classList.add('sunny');
    }

    const dateObj = new Date();
    document.getElementById('time').textContent = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('day').textContent = dateObj.toLocaleDateString(undefined, { weekday: 'long' });
}

function displayForecast(forecastList) {
    const forecastData = document.getElementById('forecast');
    forecastData.innerHTML = '';

    for (let i = 0; i < forecastList.length; i += 8) { // 8 * 3-hour segments = 1 day
        const forecast = forecastList[i];
        const forecastElement = document.createElement('div');
        forecastElement.className = 'flex-column';
        forecastElement.innerHTML = `
            <p class="small mb-1">${new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</p>
            <p class="small mb-0"><strong>${forecast.main.temp_max}°F</strong></p>
            <p class="small mb-0">${forecast.weather[0].description}</p>
        `;
        forecastData.appendChild(forecastElement);
    }
}

function convertTemperature() {
    if (isCelsius) {
        document.getElementById('temperature').innerHTML = getWeatherIcon(document.getElementById('conditions').textContent) + ` ${currentTempF}°F`;
        isCelsius = false;
    } else {
        const tempC = ((currentTempF - 32) * 5 / 9).toFixed(2);
        document.getElementById('temperature').innerHTML = getWeatherIcon(document.getElementById('conditions').textContent) + ` ${tempC}°C`;
        isCelsius = true;
    }
}

function getWeatherIcon(conditions) {
    if (conditions.includes('rain')) {
        return '<i class="fas fa-cloud-showers-heavy"></i>';
    } else if (conditions.includes('cloud')) {
        return '<i class="fas fa-cloud"></i>';
    } else {
        return '<i class="fas fa-sun"></i>';
    }
}
