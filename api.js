document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to the buttons
    document.getElementById('zip-code-btn').addEventListener('click', getWeatherByZip);
    document.getElementById('city-state-btn').addEventListener('click', getWeatherByCityState);
    document.getElementById('geo-btn').addEventListener('click', getWeatherByGeo);
    document.getElementById('convert-temp').addEventListener('click', convertTemperature);
});

// Initialize global variables
let currentTempF = 0;
let isCelsius = false;
const apiKey = 'f9acd824dab7816e7165a2c185c13d65';
const proxyUrl = ''; // Set to 'https://cors-anywhere.herokuapp.com/' if needed for CORS

// Function to get weather data by zip code
async function getWeatherByZip() {
    const zipCode = document.getElementById('zip-code').value;
    if (zipCode) {
        // Fetch geo location data by zip code
        const geoResponse = await fetch(`${proxyUrl}https://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${apiKey}`);
        const geoData = await geoResponse.json();
        getWeatherData(geoData.lat, geoData.lon, geoData.name);
    } else {
        alert("Please enter a zip code.");
    }
    // When await is used in front of a Promise, it pauses the execution of the async function until the Promise is settled.
}

// Function to get weather data by city and state
async function getWeatherByCityState() {
    const cityState = document.getElementById('city-state').value;
    if (cityState) {
        // Split divides the string into an array of substrings
        // Map iterates through each element and trim removes whitespace from the beginning and end of the string
        const [city, state] = cityState.split(',').map(item => item.trim());
        // Fetch geo location data by city and state
        const geoResponse = await fetch(`${proxyUrl}https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&appid=${apiKey}`);
        const geoData = await geoResponse.json();
        getWeatherData(geoData[0].lat, geoData[0].lon, geoData[0].name);
    } else {
        alert("Please enter a city and state.");
    }
}

// Function to get weather data by geolocation
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

// Function to fetch and display weather data based on latitude and longitude
async function getWeatherData(lat, lon, city) {
    const weatherResponse = await fetch(`${proxyUrl}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const weatherData = await weatherResponse.json();
    const forecastResponse = await fetch(`${proxyUrl}https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();
    displayWeather(weatherData, city);
    displayForecast(forecastData.list);
}

// Function to display the current weather data
function displayWeather(data, city) {
    currentTempF = data.main.temp; // Update the global variable with the current temperature
    const conditions = data.weather[0].description.toLowerCase();
    const weatherIcon = getWeatherIcon(conditions);
    const weatherBackground = getWeatherBackground(conditions);

    document.getElementById('location').textContent = city;
    document.getElementById('temperature').innerHTML = `${weatherIcon} ${currentTempF}°F`;
    document.getElementById('feels-like').textContent = `${data.main.feels_like}°F`;
    // Capitalize the first letter of the conditions and set the weather condition text
    document.getElementById('weather-condition').textContent = conditions.charAt(0).toUpperCase() + conditions.slice(1);

    const weatherIconElement = document.getElementById('weather-icon');
    weatherIconElement.innerHTML = weatherIcon;
    weatherIconElement.className = 'weather-icon';
    weatherIconElement.classList.add(getWeatherConditionClass(conditions));

    document.querySelector('.bg-image img').src = weatherBackground;
}

// Function to get the background image based on weather conditions
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

// Function to get the weather icon based on weather conditions
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

// Function to get the weather condition class based on weather conditions
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

// Function to display the weather forecast data
function displayForecast(forecastList) {
    const forecastData = document.getElementById('forecast');
    forecastData.innerHTML = '';

    for (let i = 0; i < forecastList.length; i += 8) {
        //Extract the forecast data for the current day (i.e., every 8th element in the forecastList array)
        const forecast = forecastList[i];
        // Create a new <div> element to hold the forecast for the current day
        const forecastElement = document.createElement('div');
        forecastElement.className = 'forecast-day';
        // Set the inner HTML of the <div> to include the date, maximum temperature, and weather description
        // The date is formatted to show a short name for the weekday (e.g., "Mon", "Tue")
        // The forecast.dt property contains a Unix timestamp (in seconds), so it is multiplied by 1000 to convert it to milliseconds for the JavaScript Date object
        forecastElement.innerHTML = `
            <h5>${new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</h5>
            <p><strong>${forecast.main.temp_max}°F</strong></p>
            <p>${forecast.weather[0].description}</p>
        `;
        forecastData.appendChild(forecastElement);
    }
}

// Function to convert the temperature between Fahrenheit and Celsius
function convertTemperature() {
    if (isCelsius) {
        // Display temperature in Fahrenheit
        document.getElementById('temperature').innerHTML = getWeatherIcon(document.getElementById('weather-condition').textContent) + ` ${currentTempF}°F`;
        isCelsius = false;
    } else {
        // Convert temperature to Celsius and display it
        const tempC = ((currentTempF - 32) * 5 / 9).toFixed(2);
        document.getElementById('temperature').innerHTML = getWeatherIcon(document.getElementById('weather-condition').textContent) + ` ${tempC}°C`;
        isCelsius = true;
    }
    // Formula: ((currentTempF - 32) * 5 / 9) Explanation: Converts Fahrenheit to Celsius using the formula (F - 32) * 5 / 9.
    // toFixed(2): Rounds the result to 2 decimal places, ensuring the temperature is displayed with two digits after the decimal point.
    // tempC: Stores the converted temperature in Celsius as a string.
}
