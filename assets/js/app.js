'use strict';

let apiBase;
if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
    console.log("Modo Local");
    apiBase = "http://localhost:3000/api/weather";
} else {
    console.log("");
    apiBase = "https://app-clima-ghod.onrender.com/api/weather";
}

const cityElement = document.querySelector("#city");
const dateElement = document.querySelector("#date");
const tempElement = document.querySelector("#temp");
const descElement = document.querySelector("#description");
const iconElement = document.querySelector("#weather-icon");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#wind");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const gpsBtn = document.querySelector("#gps-btn");
const weatherContainer = document.querySelector("#weather-data");
const loader = document.querySelector("#loader");
const errorMsg = document.querySelector("#error-msg");
const historyContainer = document.querySelector("#history"); 
const forecastContainer = document.querySelector("#forecast-container");

async function getWeatherData(queryType, value) {
    toggleLoader(true);
    resetUI();

    try {
        let url = '';

        if (queryType === 'city') {
            if (!value) throw { user: "Por favor, digite o nome de uma cidade." };
            url = `${apiBase}?city=${value}`;
        } else if (queryType === 'coords') {
            url = `${apiBase}?lat=${value.lat}&lon=${value.lon}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.status === 404) throw { user: "Localização não encontrada." };
        if (response.status === 401) throw { user: "Serviço indisponível temporariamente." };
        if (!response.ok) throw { user: "Erro ao obter dados do clima." };
        if (data.cod && data.cod != 200) throw { user: "Erro inesperado na API." };

        updateUI(data);
        saveToHistory(data.name);
        
        getForecast(data.coord.lat, data.coord.lon);

    } catch (error) {
        showError(error.user || "Erro de conexão com o servidor.");
    } finally {
        toggleLoader(false);
    }
}

async function getForecast(lat, lon) {
    try {
        let baseUrl = apiBase.replace("/weather", "/forecast"); 
        const url = `${baseUrl}?lat=${lat}&lon=${lon}`;

        const response = await fetch(url);
        const data = await response.json();

        const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        renderForecast(dailyData);

    } catch (error) {
        console.error("Erro na previsão:", error);
    }
}

function renderForecast(days) {
    forecastContainer.innerHTML = ""; 

    days.forEach(day => {
        const date = new Date(day.dt * 1000); 
        const weekday = date.toLocaleDateString("pt-BR", { weekday: 'short' }).replace('.', '');
        const icon = day.weather[0].icon;
        const temp = Math.round(day.main.temp);

        const card = `
            <div class="forecast-item">
                <div class="forecast-day text-uppercase">${weekday}</div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" class="forecast-icon" alt="icon">
                <div class="forecast-temp">${temp}°</div>
            </div>
        `;
        
        forecastContainer.innerHTML += card;
    });
}

function saveToHistory(cityName) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    history = history.filter(c => c.toLowerCase() !== cityName.toLowerCase());
    history.unshift(cityName);
    if (history.length > 4) history.pop();
    localStorage.setItem('weatherHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    historyContainer.innerHTML = ""; 

    history.forEach(city => {
        const btn = document.createElement("button");
        btn.classList.add("history-btn");
        btn.innerText = city;
        btn.addEventListener("click", () => {
            getWeatherData('city', city);
        });
        historyContainer.appendChild(btn);
    });
}

function getUserLocation() {
    if (navigator.geolocation) {
        toggleLoader(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherData('coords', { lat, lon });
            },
            (error) => {
                toggleLoader(false);
                showError("Permissão de localização negada.");
            }
        );
    } else {
        showError("Navegador sem suporte a GPS.");
    }
}

function updateUI(data) {
    cityElement.innerText = `${data.name}, ${data.sys.country}`;
    tempElement.innerText = `${Math.round(data.main.temp)}°C`;
    descElement.innerText = data.weather[0].description;
    humidityElement.innerText = `${data.main.humidity}%`;
    windElement.innerText = `${data.wind.speed} km/h`;

    const iconCode = data.weather[0].icon;
    iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    iconElement.style.visibility = "visible";

    const now = new Date();
    dateElement.innerText = now.toLocaleDateString("pt-BR", {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    if(iconCode.endsWith("n")) {
        document.body.style.backgroundColor = "#161e25ff";
    } else {
        document.body.style.backgroundColor = "#007be7ed";
    }
    weatherContainer.classList.remove("d-none");
}

function resetUI() {
    errorMsg.classList.add("d-none");
    weatherContainer.classList.add("d-none");
}

function toggleLoader(state) {
    if (state) loader.classList.remove("d-none");
    else loader.classList.add("d-none");
}

function showError(message) {
    errorMsg.innerHTML = `<small>${message}</small>`;
    errorMsg.classList.remove("d-none");
    weatherContainer.classList.add("d-none");
}

searchBtn.addEventListener("click", () => getWeatherData('city', searchInput.value));
gpsBtn.addEventListener("click", getUserLocation);
searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") getWeatherData('city', searchInput.value);
});

renderHistory(); 
getWeatherData('city', "São Paulo");