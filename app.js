document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "2b908002fba46f9c46af71f19132295d"; 
    // API Key for OpenWeatherMap
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather"; 
    // // URL for current weather data
    const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast"; 
    // // URL for weather forecast data

    // Getting references to the DOM elements
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const locationButton = document.getElementById("locationButton");
    const recentSearchesDropdown = document.getElementById("recentSearches");

    // Function to fetch current weather for a given city
    function fetchWeather(city) {
        fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => updateWeatherUI(data)) // Update UI with weather data
            .catch(error => console.error("Error fetching weather data:", error));
    }

    // Function to fetch weather forecast for a given city
    function fetchForecast(city) {
        fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => updateForecastUI(data)) // Update UI with forecast data
            .catch(error => console.error("Error fetching forecast data:", error));
    }

    // Function to fetch weather based on latitude and longitude
    function fetchWeatherByCoords(lat, lon) {
        fetch(`${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                updateWeatherUI(data); // Update UI with fetched weather data
                fetchForecastByCoords(lat, lon); // Fetch forecast data for the same coordinates
            })
            .catch(error => console.error("Error fetching weather data:", error));
    }

    // Function to fetch forecast based on latitude and longitude
    function fetchForecastByCoords(lat, lon) {
        fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => updateForecastUI(data)) // Update UI with forecast data
            .catch(error => console.error("Error fetching forecast data:", error));
    }

    // Function to update the UI with the weather data
    function updateWeatherUI(data) {
        if (!data || data.cod !== 200) { // Check if the data is valid
            alert("City not found! Try again."); // Alert if city not found
            return;
        }

        // Displaying weather details in the UI
        document.getElementById("cityName").innerHTML = `${data.name} (${new Date().toLocaleDateString()})`;
        document.getElementById("temperature").innerHTML = `${data.main.temp}°C`;
        document.getElementById("windSpeed").innerHTML = `${data.wind.speed} M/S`;
        document.getElementById("humidity").innerHTML = `${data.main.humidity}%`;
        document.getElementById("weatherDescription").innerHTML = data.weather[0].description;
        document.getElementById("weatherIcon").src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

        addToRecentSearches(data.name); // Store the searched city in local storage
    }

    // Function to update the UI with the forecast data
    function updateForecastUI(data) {
        if (!data || data.cod !== "200") { // Check if the forecast data is valid
            return;
        }

        const forecastContainer = document.getElementById("forecastContainer");
        forecastContainer.innerHTML = ""; // Clear previous forecast data

        const dailyForecasts = {}; // Object to store unique daily forecasts

        // Iterating through the list of forecast data to get daily summaries
        data.list.forEach(entry => {
            const date = entry.dt_txt.split(" ")[0]; // Extracting the date part from API response
            if (!dailyForecasts[date]) { // Ensuring only one entry per day is taken
                dailyForecasts[date] = entry;
            }
        });

        // Creating forecast cards for the next 5 days
        Object.values(dailyForecasts).slice(0, 5).forEach(entry => {
            const div = document.createElement("div");
            div.classList.add("bg-gray-300", "text-center", "p-3", "rounded");
            div.innerHTML = `
                <h3>${new Date(entry.dt_txt).toLocaleDateString()}</h3>
                <img src="http://openweathermap.org/img/wn/${entry.weather[0].icon}.png" class="mx-auto w-12 h-12" alt="Weather Icon">
                <p>Temp: ${entry.main.temp}°C</p>
                <p>Wind: ${entry.wind.speed} M/S</p>
                <p>Humidity: ${entry.main.humidity}%</p>
            `;
            forecastContainer.appendChild(div); // Append forecast card to UI
        });
    }

    // Function to store searched city in localStorage and update recent searches dropdown
    function addToRecentSearches(city) {
        let searches = JSON.parse(localStorage.getItem("recentSearches")) || []; // Retrieve previous searches
        if (!searches.includes(city)) { // Add new city if not already present
            searches.unshift(city);
            if (searches.length > 5) { // Keep only the last 5 searches
                searches.pop();
            }
            localStorage.setItem("recentSearches", JSON.stringify(searches)); // Store updated list
        }
        displayRecentSearches(); // Refresh dropdown with updated list
    }

    // Function to display recent searches in a dropdown menu
    function displayRecentSearches() {
        let searches = JSON.parse(localStorage.getItem("recentSearches")) || []; // Retrieve stored searches
        recentSearchesDropdown.innerHTML = "<option value=''>Select a city</option>"; // Default option

        searches.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.innerHTML = city;
            recentSearchesDropdown.appendChild(option); // Add city to dropdown list
        });
    }

    // Function to fetch weather for the user's current location using geolocation API
    function fetchCurrentLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude); // Fetch weather using coordinates
            }, () => {
                alert("Location access denied. Please enter a city manually.");
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    // Event listener for search button click
    searchButton.addEventListener("click", () => {
        const city = searchInput.value.trim(); // Get user input
        if (city) {
            fetchWeather(city); // Fetch weather data for entered city
            fetchForecast(city); // Fetch forecast data for entered city
        }
    });

    // Event listener for location button click
    locationButton.addEventListener("click", fetchCurrentLocationWeather);

    // Event listener for selecting a recent search from dropdown
    recentSearchesDropdown.addEventListener("change", () => {
        const selectedCity = recentSearchesDropdown.value;
        if (selectedCity) {
            fetchWeather(selectedCity); 
            // Fetch weather for selected city
            fetchForecast(selectedCity); 
            // Fetch forecast for selected city
        }
    });

    // Load recent searches when the page loads
    displayRecentSearches(); 
});
