const OPEN_WEATHER_API_KEY = "f32f339d5eda5e2a9a10c88456f2c076";

// Clears out weather cards to be repopulated with content
function clearWeather() {

    // Set text of each div to be empty
    for (var i = 0; i < 5; i++) {
        $(`#todayPlus${i + 1}`).text("");
    }

    $(`#temperature`).text("");
    $(`#wind`).text("");
    $(`#humidity`).text("");
    $(`#UVIndex`).text("");

}

// Render the screen for a new search
async function renderWeather(cityName) {

    // Clear out elements of any previously searched-for weather
    clearWeather();

    // Get forecast data from an OpenWeatherMap API call
    var forecast = await getWeatherData(cityName);

    // Handle if there was no result from the search
    if (!forecast) {

        // Create a main error message
        var errorEl = $(`<h3 />`).text("Sorry -  we couldn't find that city.")
        $(`#cityName`).text("")
        $(`#cityName`).append(errorEl);

        // Fill in forecast cards with blank space
        for (var i = 1; i < 6; i++) {

            // Create blank space for cards and append each
            var searchAgainMessageEl = $(`<p/>`);
            searchAgainMessageEl.attr("style", "height: 150px")
            $(`#todayPlus${i}`).append(searchAgainMessageEl);
        }

        // Remove the styling on the UV index
        $(`#UVIndex`).removeClass();

        return false;
    }

    // Render today's information to the main card
    $(`#temperature`).text(`Temp: ${forecast.current.temp} F`);
    $(`#wind`).text(`Wind: ${forecast.current.wind_speed} MPH`);
    $(`#humidity`).text(`Humidity: ${forecast.current.humidity} %`);
    $(`#UVIndex`).text(`UV Index: ${forecast.current.uvi}`);

    // Show different colors on the UV Index element based on the value
    setUVIndexColor(forecast.current.uvi);

    // Render forecast cards for the next 5 days
    for (var i = 0; i < 5; i++) {

        // Grab each card div to insert data into
        var upcomingWeatherDateEl = $(`#todayPlus${i + 1}`);

        // Create date element
        var date = new Date(forecast.daily[i + 1].dt * 1000);
        var dateStringEl = $(`<h5/>`).text(`(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`);

        // Create a url to get an icon image
        var iconCode = forecast.daily[i].weather[0].icon;
        var iconurl = `http://openweathermap.org/img/w/${iconCode}.png`;

        // Create icon element using url
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

    // Update the previous searches bar to include the newly searched city
    loadPreviousSearches();

    return true;
}

// Save a search term (city) to localstorage to remember searches
function saveSearchTerm(searchTerm) {

    // Get current search terms
    var prevTerms = JSON.parse(localStorage.getItem("searches"));

    // Append new term to beginning of array
    prevTerms.unshift(searchTerm);

    // Resave array with newly added value
    localStorage.setItem("searches", JSON.stringify(prevTerms));
}

// Set up event handlers for searching for a new city by name
function setupSearchHandlers() {

    // Handle seaching by clicking button
    $(`#searchButton`).on("click", async () => {
        var result = await renderWeather($(`#searchInput`).val());

        console.log(result);
        if (!result) {
            return;
        }
        // If the search was valid, save it to the record of past searches
        saveSearchTerm($(`#searchInput`).val());
        loadPreviousSearches();

    });

    // Handle searching by clicking enter
    $(`#searchInput`).keypress(async (event) => {

        // If user pressed enter while on the form
        if (event.which == 13) {
            var result = await renderWeather($(`#searchInput`).val());
            
            if (!result) {
                return;
            }
            // If the search was valid, save it to the record of past searches
            saveSearchTerm($(`#searchInput`).val());
            loadPreviousSearches();

        }

    })
}

// Set the UV Index element's background based on how severe the index is
function setUVIndexColor(UVIndex) {

    // Remove any previous values from previous searches
    $(`#UVIndex`).removeClass();

    // Styling
    $(`#UVIndex`).addClass("p-1 border rounded rounded-4");

    // Set a background color based on the actual value
    if (UVIndex < 3) {
        $(`#UVIndex`).addClass("bg-success");
    } else if (UVIndex >= 3 || UVIndex < 7) {
        $(`#UVIndex`).addClass("bg-warning")
    } else {
        $(`#UVIndex`).addClass("bg-failure")
    }
}

// Get the weather forecast data for a particular city
async function getWeatherData(city) {

    // Create a url to query the api with based on text input with imperial units
    var searchURI = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_API_KEY}&units=imperial`;

    // Get the result back and store it in a variable
    var result = await fetch(searchURI)
        .then(response => response.json())
        .then(data => {
            return data;
        })

    // If there is no result, return with no info
    if (!result.name) {
        return;
    }

    // Create a latitude/longitude object based on the result to use with another API call
    var latLong = {
        latitude: result.coord.lat,
        longitude: result.coord.lon
    }

    // Query the API's onecall endpoint for forecast data from a full week
    var oneCallURI = `https://api.openweathermap.org/data/2.5/onecall?lat=${latLong.latitude}&lon=${latLong.longitude}&appid=${OPEN_WEATHER_API_KEY}&units=imperial`

    // Get the result back and store it in a variable
    var oneCall = await fetch(oneCallURI)
        .then(response => response.json())
        .then(data => {
            return data;
        })

    // Render the title of the city based on the resulting data
    renderTitle(result, oneCall)

    // return the next week's forecast data for any further use
    return oneCall;

}

// Render the title information (city name, date) to the DOM
function renderTitle(result, oneCall) {

    // Create a date string to display
    var date = new Date(oneCall.current.dt * 1000);
    var dateString = `(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`;

    // Create a url to get an icon image
    var iconCode = result.weather[0].icon;
    var iconurl = `http://openweathermap.org/img/w/${iconCode}.png`;

    // Create icon element using url
    var iconEl = $(`<img/>`);
    iconEl.addClass("my-3");
    iconEl.attr("src", iconurl);

    // Create a title element using the searched city's name and the current date
    var titleEl = $(`<h3 id="cityName" class="card-title py-2">`).text(`${result.name} ${dateString}`);

    // Clear any previously rendered elements
    $(`#cityName`).text("");

    // Append the city title/date and the current weather icon to render them
    $(`#cityName`).append(titleEl);
    $(`#cityName`).append(iconEl);
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