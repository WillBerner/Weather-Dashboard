const OPEN_WEATHER_API_KEY = "f32f339d5eda5e2a9a10c88456f2c076";

// Clears out weather cards to be repopulated with content
function clearWeather() {

    // Set text of each div to be empty
    for (var i = 0; i < 5; i++) {
        $(`#todayPlus${i + 1}`).text("");
    }

}

async function renderWeather(cityName) {

    clearWeather();

    // Get forecast data from API call
    var forecast = await getWeatherData(cityName);

    // Render today's information to the main card
    $(`#temperature`).text(`Temp: ${forecast.current.temp} F`);
    $(`#wind`).text(`Wind: ${forecast.current.wind_speed} MPH`);
    $(`#humidity`).text(`Humidity: ${forecast.current.humidity} %`);
    $(`#UVIndex`).text(`UV Index: ${forecast.current.uvi}`);

    setUVIndexColor(forecast.current.uvi);

    // Render forecast cards for the next 5 days
    for (var i = 0; i < 5; i++) {

        // Grab each card div to insert data into
        var upcomingWeatherDateEl = $(`#todayPlus${i + 1}`);

        // Create date element
        var date = new Date(forecast.daily[i + 1].dt * 1000);
        var dateStringEl = $(`<h5/>`).text(`(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`);

        // Render icon
        var iconCode = forecast.daily[i].weather[0].icon;
        var iconurl = `http://openweathermap.org/img/w/${iconCode}.png`;

        // Create icon element
        var iconEl = $(`<img/>`);
        iconEl.addClass("my-3");
        iconEl.attr("src", iconurl);

        // Create a container for the icon
        var iconContainer = $("<div />");
        iconContainer.append(iconEl);

        // Create temperature element
        var dateTempEl = $(`<p/>`).text(`Temp: ${forecast.daily[i + 1].temp.day} F`)

        // Create wind speed element
        var dateWindEl = $(`<p/>`).text(`Wind: ${forecast.daily[i + 1].wind_speed} MPH`)

        // Create humidity element
        var dateHumidityEl = $(`<p/>`).text(`Humidity: ${forecast.daily[i + 1].humidity} %`)

        // Append each new element to the html
        upcomingWeatherDateEl.append(dateStringEl);
        upcomingWeatherDateEl.append(iconContainer);
        upcomingWeatherDateEl.append(dateTempEl);
        upcomingWeatherDateEl.append(dateWindEl);
        upcomingWeatherDateEl.append(dateHumidityEl);

    }

    loadPreviousSearches();
}

function saveSearchTerm(searchTerm) {

    var prevTerms = JSON.parse(localStorage.getItem("searches"));

    prevTerms.unshift(searchTerm);

    localStorage.setItem("searches", JSON.stringify(prevTerms));
}

function setupSearchHandlers() {

    // Handle seaching by clicking button
    $(`#searchButton`).on("click", () => {
        saveSearchTerm($(`#searchInput`).val());
        renderWeather($(`#searchInput`).val());
    });

    // Handle searching by clicking enter
    $(`#searchInput`).keypress((event) => {

        // If user pressed enter while on the form
        if (event.which == 13) {
            saveSearchTerm($(`#searchInput`).val());
            renderWeather($(`#searchInput`).val());
        }

    })
}

function setUVIndexColor(UVIndex) {

    $(`#UVIndex`).removeClass();
    $(`#UVIndex`).addClass("p-1 border rounded rounded-4");

    if (UVIndex < 3) {
        $(`#UVIndex`).addClass("bg-success");
    } else if (UVIndex >= 3 || UVIndex < 7) {
        $(`#UVIndex`).addClass("bg-warning")
    } else {
        $(`#UVIndex`).addClass("bg-failure")
    }

}

async function getWeatherData(city) {
    var searchURI = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_API_KEY}&units=imperial`;

    var result = await fetch(searchURI)
        .then(response => response.json())
        .then(data => {
            return data;
        });

    var latLong = {
        latitude: result.coord.lat,
        longitude: result.coord.lon
    }

    var oneCallURI = `https://api.openweathermap.org/data/2.5/onecall?lat=${latLong.latitude}&lon=${latLong.longitude}&appid=${OPEN_WEATHER_API_KEY}&units=imperial`

    var oneCall = await fetch(oneCallURI)
        .then(response => response.json())
        .then(data => {
            return data;
        })

    var date = new Date(oneCall.current.dt * 1000);

    var dateString = `(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`;

    // Render icon
    var iconCode = result.weather[0].icon;
    var iconurl = `http://openweathermap.org/img/w/${iconCode}.png`;

    // Create icon element
    var iconEl = $(`<img/>`);
    iconEl.addClass("my-3");
    iconEl.attr("src", iconurl);

    var titleEl = $(`<h3 id="cityName" class="card-title py-2">`).text(`${result.name} ${dateString}`);
    $(`#cityName`).append(titleEl);
    $(`#cityName`).append(iconEl);

    return oneCall;

}

// Load and render the weather for the last city searched
function loadLastSearchedCity() {

    // Get all recent search Histories
    var recentTerms = getSearchHistory()

    // Get the most recent search term
    var mostRecentSearch = recentTerms[0];

    // Render the most recently searched city
    renderWeather(mostRecentSearch);

}

// Retrieve previous searches terms from localstorage and return them
function getSearchHistory() {

    // Get the search term array from localstorage
    var searchHistory = JSON.parse(localStorage.getItem("searches"));

    // If there is no array (first time accessing website)
    // then create and save a new empty array
    if (!searchHistory) {

        // Defaults to Chapel Hill if the user hasn't searched anything yet
        searchHistory = ["Chapel Hill"];
        localStorage.setItem("searches", JSON.stringify(searchHistory));
        return searchHistory;
    } else {
        return searchHistory;
    }
}

// Load previous searches and render buttons elements 
// on the homepage to search for those locations again
function loadPreviousSearches() {

    // Retrieve the most recent past searches
    var searchHistory = getSearchHistory();

    // Make sure container is already empty of buttons before rendering more
    $(`#previouslySearchedCitiesContainer`).text("");

    // Loop over each past search term in the data
    for (var i = 0; i < 10; i++) {

        if (searchHistory[i]) {

            // Create each search button dynamically from retrieved data
            searchButtonEl = $("<button></button>").text(searchHistory[i]);
            searchButtonEl.attr("id", searchHistory[i]);
            searchButtonEl.addClass("btn btn-secondary w-100 my-1");

            // Create clickh handlers for each button to search a term again
            searchButtonEl.on("click", (event) => {
                saveSearchTerm(event.target.id);
                renderWeather(event.target.id);
            });

            // Append search buttons to container
            $(`#previouslySearchedCitiesContainer`).append(searchButtonEl);

        }
    }
}

// Do any initialization and setup
function init() {

    // 1. Load previous searches and render buttons to search for those locations again
    loadPreviousSearches();

    // 2. Load the most recently searched city to the results screen as default
    loadLastSearchedCity();

    // 3. Set up event handlers for searching for a city
    setupSearchHandlers();

}

// Start 'er up
init();