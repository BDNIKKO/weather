document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('zip-code-btn').addEventListener('click', getWeatherByZip);
    document.getElementById('city-state-btn').addEventListener('click', getWeatherByCityState);
    document.getElementById('geo-btn').addEventListener('click', getWeatherByGeo);
    document.getElementById('convert-temp').addEventListener('click', convertTemperature);
});

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
    const forecastData = await forecastResponse.json();
    displayWeather(weatherData, city);
    displayForecast(forecastData.list);
}

function displayWeather(data, city) {
    currentTempF = data.main.temp;
    const tempHi = data.main.temp_max;
    const tempLo = data.main.temp_min;
    const conditions = data.weather[0].description.toLowerCase();
    const weatherIcon = getWeatherIcon(conditions);
    const weatherBackground = getWeatherBackground(conditions);

    document.getElementById('location').textContent = city;
    document.getElementById('temperature').innerHTML = `${weatherIcon} ${currentTempF}°F`;
    document.getElementById('feels-like').textContent = `${data.main.feels_like}°F`;
    document.getElementById('weather-condition').textContent = conditions.charAt(0).toUpperCase() + conditions.slice(1);

    const weatherIconElement = document.getElementById('weather-icon');
    weatherIconElement.innerHTML = weatherIcon;
    weatherIconElement.className = 'weather-icon';
    weatherIconElement.classList.add(getWeatherConditionClass(conditions));

    document.querySelector('.bg-image img').src = weatherBackground;
}

function getWeatherBackground(conditions) {
    if (conditions.includes('thunderstorm') || conditions.includes('drizzle') || conditions.includes('rain')) {
        return 'images/rainy.jpg';
    } else if (conditions.includes('snow') || conditions.includes('sleet')) {
        return 'images/snowy.jpg';
    } else if (conditions.includes('mist') || conditions.includes('smoke') || conditions.includes('haze') || conditions.includes('fog') || conditions.includes('clouds')) {
        return 'images/cloudy.jpg';
    } else {
        return 'images/clear.jpg';
    }
}

function getWeatherIcon(conditions) {
    if (conditions.includes('rain')) {
        return '<i class="fas fa-cloud-showers-heavy"></i>';
    } else if (conditions.includes('cloud')) {
        return '<i class="fas fa-cloud"></i>';
    } else if (conditions.includes('snow')) {
        return '<i class="fas fa-snowflake"></i>';
    } else {
        return '<i class="fas fa-sun"></i>';
    }
}

function getWeatherConditionClass(conditions) {
    if (conditions.includes('rain')) {
        return 'rainy';
    } else if (conditions.includes('cloud')) {
        return 'cloudy';
    } else if (conditions.includes('snow')) {
        return 'snowy';
    } else {
        return 'sunny';
    }
}

function displayForecast(forecastList) {
    const forecastData = document.getElementById('forecast');
    forecastData.innerHTML = '';

    for (let i = 0; i < forecastList.length; i += 8) { 
        const forecast = forecastList[i];
        const forecastElement = document.createElement('div');
        forecastElement.className = 'forecast-day';
        forecastElement.innerHTML = `
            <h5>${new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</h5>
            <p><strong>${forecast.main.temp_max}°F</strong></p>
            <p>${forecast.weather[0].description}</p>
        `;
        forecastData.appendChild(forecastElement);
    }
}

function convertTemperature() {
    if (isCelsius) {
        document.getElementById('temperature').innerHTML = getWeatherIcon(document.getElementById('weather-condition').textContent) + ` ${currentTempF}°F`;
        isCelsius = false;
    } else {
        const tempC = ((currentTempF - 32) * 5 / 9).toFixed(2);
        document.getElementById('temperature').innerHTML = getWeatherIcon(document.getElementById('weather-condition').textContent) + ` ${tempC}°C`;
        isCelsius = true;
    }
}
