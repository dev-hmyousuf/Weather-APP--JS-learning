let mainBody = document.getElementById("mainBody");
let icon = document.getElementById("icon");
let form = document.getElementById("form");
const apiKey = "b50f2931fb3f9e597f3c2d9e7f75b61a";
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&`;
let cityN = document.getElementById("cityNameDisplay");
let temp = document.getElementById("temp");
let humidity = document.getElementById("humidityDisplay");
let wind = document.getElementById("windDisplay");
let feelsLike = document.getElementById("feelsLike");
let getLocationBtn = document.getElementById("getLocationBtn");
let cityInput = document.getElementById("cityInput");
let suggestionsList = document.getElementById("suggestions");

// Function to update background based on weather
function updateBackground(weatherCondition) {
    mainBody.classList.remove('bg-sunny', 'bg-cloudy', 'bg-rainy', 'bg-misty', 'bg-drizzle');

    switch (weatherCondition) {
        case 'Clear':
            mainBody.classList.add('bg-sunny');
            icon.src = "img/clear.png";
            break;
        case 'Clouds':
            mainBody.classList.add('bg-cloudy');
            icon.src = "img/clouds.png";
            break;
        case 'Rain':
            mainBody.classList.add('bg-rainy');
            icon.src = "img/rain.png";
            break;
        case 'Drizzle':
            mainBody.classList.add('bg-drizzle');
            icon.src = "img/drizzle.png";
            break;
        case 'Mist':
            mainBody.classList.add('bg-misty');
            icon.src = "img/mist.png";
            break;
        default:
            mainBody.classList.add('bg-default');
    }
}

// Function to get weather by city name
async function getWeather(cityName) {
    try {
        let response = await fetch(`${apiUrl}q=${cityName}&appid=${apiKey}`);
        let data = await response.json();

        if (data.cod === "404") {
            alert("City not found!");
            return;
        }

        cityInput.setAttribute("placeholder", `${data.name}, ${data.sys.country}`);
        cityN.textContent = `${data.name}, ${data.sys.country}`;
        temp.textContent = data.main.temp + '°C';
        humidity.textContent = data.main.humidity + '%';
        wind.textContent = data.wind.speed + ' km/h';
        feelsLike.textContent = data.weather[0].main;

        updateBackground(data.weather[0].main);

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Get weather for current location
async function getCurrentLocWeather(lat, lon) {
    try {
        const response = await fetch(`${apiUrl}lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();

        cityInput.setAttribute("placeholder", `${data.name}, ${data.sys.country}`);
        cityN.textContent = `${data.name}, ${data.sys.country}`;
        temp.innerHTML = `${data.main.temp}<span>°C</span>`;
        humidity.innerHTML = `${data.main.humidity}%`;
        wind.innerHTML = `${data.wind.speed} km/h`;
        feelsLike.innerHTML = data.weather[0].main;

        updateBackground(data.weather[0].main);

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Event listener for current location weather
getLocationBtn.addEventListener("click", function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getCurrentLocWeather(latitude, longitude);
        }, (error) => {
            console.error("Error getting location:", error.message);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
});

// Event listener for form submit (search by city)
form.addEventListener("submit", function(event) {
    event.preventDefault();
    let city = cityInput.value;
    getWeather(city);
    suggestionsList.classList.add("hidden"); // Hide the suggestions on form submit
});

// Load current location weather on page load
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getCurrentLocWeather(latitude, longitude);
        }, (error) => {
            console.error("Error getting location:", error.message);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
};

// City suggestions
const geoApiUrl = "http://api.openweathermap.org/geo/1.0/direct";

async function fetchCitySuggestions(query) {
    const response = await fetch(`${geoApiUrl}?q=${query}&limit=5&appid=${apiKey}`);
    const data = await response.json();
    return data;
}

function displaySuggestions(cities) {
    suggestionsList.innerHTML = '';
    if (cities.length === 0) {
        suggestionsList.classList.add("hidden");
        return;
    }
    cities.forEach(city => {
        const suggestionItem = document.createElement('li');
        suggestionItem.classList.add("cursor-pointer", "p-2", "hover:bg-gray-100");
        suggestionItem.textContent = `${city.name}, ${city.country}`;
        suggestionItem.onclick = () => {
            cityInput.value = city.name;
            suggestionsList.classList.add("hidden");
            getWeather(city.name);  // Fetch weather when a suggestion is clicked
        };
        suggestionsList.appendChild(suggestionItem);
    });
    suggestionsList.classList.remove("hidden");
}

cityInput.addEventListener("input", async (e) => {
    const query = e.target.value;
    if (query.length > 2) {
        const cities = await fetchCitySuggestions(query);
        displaySuggestions(cities);
    } else {
        suggestionsList.classList.add("hidden");
    }
});

document.addEventListener("click", function(event) {
    if (!form.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.classList.add("hidden"); 
    }
});
