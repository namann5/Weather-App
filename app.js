// ------------------------------
// CONFIG
// ------------------------------
const apiKey = "0676d18bf2b85065393605bb996c2066";
const weatherURL = "https://api.openweathermap.org/data/2.5/weather";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast";

// ------------------------------
// DOM ELEMENTS
// ------------------------------
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const suggestions = document.querySelector(".suggestions");
const locationBtn = document.querySelector("#currentLocationBtn");

// ------------------------------
// AUTOCOMPLETE CITY SUGGESTIONS
// ------------------------------
async function getCitySuggestions(query) {
    if (query.length < 2) {
        suggestions.innerHTML = "";
        return;
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    suggestions.innerHTML = "";
    data.forEach(city => {
        const li = document.createElement("li");
        li.textContent = `${city.name}, ${city.country}`;
        li.onclick = () => {
            searchBox.value = city.name;
            suggestions.innerHTML = "";
            checkWeather(city.name);
        };
        suggestions.appendChild(li);
    });
}

searchBox.addEventListener("input", () => {
    getCitySuggestions(searchBox.value);
});

// ------------------------------
// FETCH WEATHER
// ------------------------------
async function checkWeather(city) {
    try {
        const res = await fetch(`${weatherURL}?q=${city}&units=metric&appid=${apiKey}`);
        const data = await res.json();

        if (data.cod === "404") {
            alert("City not found!");
            return;
        }

        updateWeatherUI(data);
        getForecast(city);

    } catch (err) {
        console.log("Error fetching weather:", err);
    }
}

// ------------------------------
// FETCH FORECAST (5 DAYS)
// ------------------------------
async function getForecast(city) {
    try {
        const res = await fetch(`${forecastURL}?q=${city}&units=metric&appid=${apiKey}`);
        const data = await res.json();

        updateForecastUI(data);
    } catch (err) {
        console.log("Forecast error:", err);
    }
}

// ------------------------------
// UPDATE UI – CURRENT WEATHER
// ------------------------------
function updateWeatherUI(data) {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    // FIXED ICON (OpenWeather CDN)
    const iconCode = data.weather[0].icon;
    document.querySelector(".weather-icon").src =
        `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    document.querySelector(".weather").style.display = "block";
}

// ------------------------------
// UPDATE UI – FORECAST (5 DAYS)
// ------------------------------
function updateForecastUI(data) {
    const forecastBox = document.querySelector(".forecast");
    forecastBox.innerHTML = "";

    const daily = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];

        if (!daily[date] && item.dt_txt.includes("12:00:00")) {
            daily[date] = item;
        }
    });

    Object.values(daily).slice(0, 5).forEach(day => {
        const iconCode = day.weather[0].icon;
        const iconURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        forecastBox.innerHTML += `
            <div class="forecast-card">
                <img src="${iconURL}" />
                <p>${day.dt_txt.split(" ")[0]}</p>
                <h3>${Math.round(day.main.temp)}°C</h3>
            </div>
        `;
    });
}

// ------------------------------
// CURRENT LOCATION WEATHER
// ------------------------------
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            const res = await fetch(`${weatherURL}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
            const data = await res.json();

            updateWeatherUI(data);
            getForecast(data.name);
        });
    } else {
        alert("Geolocation not supported.");
    }
});

// ------------------------------
// SEARCH BUTTON
// ------------------------------
searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

// ------------------------------
// AUTO REFRESH EVERY 10 MINUTES
// ------------------------------
setInterval(() => {
    if (document.querySelector(".city").innerHTML !== "") {
        checkWeather(document.querySelector(".city").innerHTML);
    }
}, 10 * 60 * 1000);
