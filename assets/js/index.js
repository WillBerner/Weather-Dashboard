







function getSearchHistory() {
    var searchHistory = JSON.parse(localStorage.getItem("seaches"));

    if (!searchHistory) {
        searchHistory = ["Chapel Hill", "Carrboro", "Hillsborough"];
        localStorage.setItem("searches", JSON.stringify(searchHistory));
        return searchHistory;
    } else {
        return searchHistory;
    }
}

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

    // Load previous searches and render buttons to search for those locations again
    loadPreviousSearches();
}

// Start 'er up
init();