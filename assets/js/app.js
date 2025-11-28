'use strict';

const apiBase = "https://app-clima-ghod.onrender.com/api/weather";

const cityElement = document.querySelector("#city");
const dateElement = document.querySelector("#date");
const tempElement = document.querySelector("#temp");
const descElement = document.querySelector("#description");
const iconElement = document.querySelector("#weather-icon");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#wind");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const weatherContainer = document.querySelector("#weather-data");
const loader = document.querySelector("#loader");
const errorMsg = document.querySelector("#error-msg");

async function getWeatherData(city) {
    toggleLoader(true);
    resetUI();

    try {
        if (!city) throw { user: "Por favor, digite o nome de uma cidade." };

        const response = await fetch(`${apiBase}?city=${city}`);
        const data = await response.json();

        if (response.status === 404) throw { user: "Cidade não encontrada." };
        if (response.status === 401) throw { user: "Serviço indisponível temporariamente." };
        if (!response.ok) throw { user: "Erro ao obter dados do clima." };
        if (data.cod && data.cod != 200) throw { user: "Erro inesperado na API." };

        updateUI(data);

    } catch (error) {
        showError(error.user || "Erro de conexão com o servidor.");
    } finally {
        toggleLoader(false);
    }
}

function updateUI(data) {
    cityElement.innerText = `${data.name}, ${data.sys.country}`;
    tempElement.innerText = `${Math.round(data.main.temp)}°C`;
    descElement.innerText = data.weather[0].description;
    humidityElement.innerText = `${data.main.humidity}%`;
    windElement.innerText = `${data.wind.speed} km/h`;

    iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    iconElement.style.visibility = "visible";

    const now = new Date();
    dateElement.innerText = now.toLocaleDateString("pt-BR", {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    weatherContainer.classList.remove("d-none");
}

function resetUI() {
    errorMsg.classList.add("d-none");
    weatherContainer.classList.add("d-none");
}

function toggleLoader(state) {
    if (state) {
        loader.classList.remove("d-none");
    } else {
        loader.classList.add("d-none");
    }
}

function showError(message) {
    errorMsg.innerHTML = `<small>${message}</small>`;
    errorMsg.classList.remove("d-none");
    weatherContainer.classList.add("d-none");
}

searchBtn.addEventListener("click", () => {
    getWeatherData(searchInput.value);
});

searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        getWeatherData(searchInput.value);
    }
});

getWeatherData("São Paulo");