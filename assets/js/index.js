const OPEN_WEATHER_API_KEY = "f32f339d5eda5e2a9a10c88456f2c076";




function setupSearchHandlers() {

    // Handle seaching by clicking button
    $(`#searchButton`).on("click", () => {
        getWeatherData($(`#searchInput`).val());
    });

    // Handle searching by clicking enter
    $(`#searchInput`).keypress((event) => {

        // If user pressed enter while on the form
        if (event.which == 13) {
            getWeatherData($(`#searchInput`).val());
        }
    })
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

    var oneCallURI = `https://api.openweathermap.org/data/2.5/onecall?lat=${latLong.latitude}&lon=${latLong.longitude}&appid=${OPEN_WEATHER_API_KEY}`

    var oneCall = await fetch(oneCallURI)
        .then(response => response.json())
        .then(data => {
            return data;
        })

    console.log(oneCall);
    var date = new Date(oneCall.current.dt * 1000);

    var dateString = `(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`;

    $(`#cityName`).text(`${result.name} ${dateString}`);

    $(`#temperature`).text(`Temp: ${result.main.temp} F`);
    $(`#wind`).text(`Wind: ${result.wind.speed} MPH`);
    $(`#humidity`).text(`Humidity: ${result.main.humidity} %`);
    $(`#UVIndex`).text(`UV Index: ${oneCall.current.uvi}`)
    
}

function loadLastSearchedCity() {
    return;
}

// Retrieve previous searches terms from localstorage and return them
function getSearchHistory() {
    var searchHistory = JSON.parse(localStorage.getItem("seaches"));

    // If there is no array (first time accessing website)
    // then create and save a new empty array
    if (!searchHistory) {
        searchHistory = ["Chapel Hill", "Carrboro", "Hillsborough"];
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

    // Loop over each past search term in the data
    searchHistory.forEach(searchString => {

        // Create each search button dynamically from retrieved data
        var searchButtonEl = $("<button></button>").text(searchString);
        searchButtonEl.addClass("btn btn-secondary w-100 my-1");

        // Append search buttons to container
        $(`#previouslySearchedCitiesContainer`).append(searchButtonEl);

    });
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