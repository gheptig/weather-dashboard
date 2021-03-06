$(document).ready(function () {

    var cityStorageArray = [];

    // Function to retrieve each item (city) in the cityStorage array and display them to the page as a button
    function getCityButtons() {
        $("#city-search-history").empty();

        var searchHistory = JSON.parse(localStorage.getItem("cityStorageArray"));
        if (!searchHistory) {
            searchHistory = [];
        } else {
            for (var i = 0; i < searchHistory.length; i++) {
                var recentSearchButton = $("<button>").addClass("btn btn-outline-secondary mt-1 w-100 text-left").attr("id", "recent-city").text(searchHistory[i].toUpperCase());
                $("#city-search-history").prepend(recentSearchButton);
            }

        }
    }


    // Function to retrieve each item (city) in the cityStorage array run the city through the city search function
    function getLastCity() {
        var parLastCity = JSON.parse(localStorage.getItem("cityStorageArray"));

        if (!parLastCity) {
            parLastCity = [];
        } else {
            var lastCity = parLastCity[parLastCity.length - 1];
            $("#current-city-display").empty();
            citySearch(lastCity);
        }
    }

    // Clear search history button
    $("#clear-btn").on("click", function (event) {
        localStorage.clear();
        location.reload();
    })

    // On click of city search button city name based on user input 
    $("#city-search-btn").on("click", function (event) {
        event.preventDefault();
        var userCityInput = $("#city-input").val();

        citySearch(userCityInput);
        getCityButtons();
    });

    // City search function that passes through user's city input as a parameter. this way user search is being passed through API URLs/calls
    function citySearch(cityInput) {
        if (cityInput == "") {
            localStorage.clear();
            $("#error-modal").modal('show');
            $("#error-text").text("Please enter a U.S. city");
        } else {

            // Set empty cityStorage array with userCityInput and set to localstorage
            cityStorageArray.push(cityInput);
            var newCity = JSON.stringify(cityStorageArray);
            localStorage.setItem("cityStorageArray", newCity);

            // Open Weather API Key
            var owApiKey = "fcb202793a3b50951b0129bcb32cb07d";

            // Current city weather url for API call (formatted in farfahrenheit and limited to US cities)
            var currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityInput},us&appid=${owApiKey}&units=imperial`;

            // 5-day city forecast url for API call (formatted in farhrenheit and limited to US cities)
            var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput},us&appid=${owApiKey}&units=imperial`;

            // Empty contents of each display on each search before new city data is called for
            $("#current-city-display").empty();
            $("#five-day-forecast").empty();

            // Current date using moment.js
            var currentDate = moment().format("L");

            // Current city weather API call
            $.get(currentURL).then(function (response) {

                // console.log(currentURL);
                // console.log(response);

                // Create current city and date element
                var currentCity = response.name;
                var currentCityEl = $("<span>", {
                    style: "font-size: 30px;"
                }).text(`${currentCity} (${currentDate}) `);

                // Create current weather icon element 
                var weatherIcon = response.weather[0].icon;
                var srcIcon = `https://openweathermap.org/img/wn/${weatherIcon}.png`;
                var currentIconEl = $("<img>", {
                    class: "icon bg-primary",
                    src: srcIcon,
                });

                // Create current temperature element
                var currentTemp = Math.floor(response.main.temp);
                var currentTempEl = $("<p>").text(`Temperature: ${currentTemp}F°`);

                // Create current humidity element
                var currentHumidity = response.main.humidity;
                var currentHumidityEl = $("<p>").text(`Humidity: ${currentHumidity}%`);

                // Create current windspeed display
                var currentWindspeed = Math.floor(response.wind.speed);
                var currentWindspeedEl = $("<p>").text(`WindSpeed: ${currentWindspeed}MPH`);

                // Append created weather information elements and append to current-city-display <div>
                $("#current-city-display").append(currentCityEl, currentIconEl, currentTempEl, currentHumidityEl, currentWindspeedEl);

                // Make UV index call using lat & lon information found in current weather object
                var lon = response.coord.lon;
                var lat = response.coord.lat;
                // console.log(lon);
                // console.log(lat);

                // UV index url to make API call
                var uvURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${owApiKey}&lon=${lon}&lat=${lat}`;

                // UV api call to get city uv index using lon & lat and then display on to html with appropiate index scale color
                $.get(uvURL).then(function (uvresponse) {
                    // console.log(uvURL);
                    // console.log(uvresponse);

                    // Create UV index element
                    var uvIndex = uvresponse.value;
                    var uvIndexOuter = $("<p>").text("UV Index: ");
                    var uvIndexInner = $("<span>").addClass("uv-box").text(uvIndex);

                    // Nest span element (index rating) within the paragraph element (UV Index text)
                    uvIndexInner.appendTo(uvIndexOuter);

                    // If statements to set and change index rating color (based 0-12 UV index scale)
                    if (uvIndex >= 0 && uvIndex <= 2.99) {
                        uvIndexInner.css("background-color", "green").text(uvIndex);
                    }
                    if (uvIndex >= 3 && uvIndex <= 5.99) {
                        uvIndexInner.css("background-color", "yellow").text(uvIndex);
                    }
                    if (uvIndex >= 6 && uvIndex <= 7.99) {
                        uvIndexInner.css("background-color", "orange").text(uvIndex);
                    }
                    if (uvIndex >= 8 && uvIndex <= 10.99) {
                        uvIndexInner.css("background-color", "red").text(uvIndex);
                    }
                    if (uvIndex >= 11) {
                        uvIndexInner.css("background-color", "violet").text(uvIndex);
                    }

                    // Append total UV index to current-city-display
                    $("#current-city-display").append(uvIndexOuter);
                });
            });
        }
        // Create call to get 5-day forecast for city
        $.get(forecastURL).then(function (forecastResponse) {
            // console.log(forecastURL);
            // console.log(forecastResponse);

            var forecastResults = forecastResponse.list;
            // console.log(forecastResults);

            // For loop that takes the "list" array found in the forecastResponse, and begins at the 4 position (3pm of the day after the current date)
            // and then returns the date by a position increment of 8 (this provides both the date for the next 5-days and the same consistent time of 3PM...)
            for (var i = 4; i < forecastResults.length; i += 8) {
                // console.log(forecastResults[i].dt);

                // Variable that uses moment to reformat the Unix date from the api call
                var formattedDate = moment.unix(forecastResults[i].dt).utc().format("L");
                // console.log(formattedDate);

                // var testTime = moment.unix(1589133600).utc().format("LLL");
                // console.log(`Test Time: ${testTime}`);

                // Variables to get weather icons for each of the 5-days at 3PM
                var fiveDayIcon = forecastResults[i].weather[0].icon;
                var fiveDaySrc = `https://openweathermap.org/img/wn/${fiveDayIcon}.png`;

                // Variables to get temp & humidity for each of 5-days
                var fiveDayTemp = Math.floor(forecastResults[i].main.temp);
                var fiveDayHum = forecastResults[i].main.humidity;

                // Div (card) for each of the 5-days to be displayed on html
                var cardDisplayDiv = $("<div>", {
                    class: "card bg-primary text-white mb-1 d-inline-block",
                    id: "day-card",
                    style: "width: 8rem;"
                });

                // Variables for created elements that are used to display 5-day forecast data
                var cardTitle = $("<h5>").addClass("card-title").text(formattedDate);
                var cardImg = $("<img>").addClass("center-text").attr("src", fiveDaySrc);
                var cardTemp = $("<p>").text(`Temp: ${fiveDayTemp}F°`);
                var cardHum = $("<p>").text(`Humidity: ${fiveDayHum}%`);

                // Append 5-day forecast card data to parent div
                $("#five-day-forecast").append(cardDisplayDiv);
                cardDisplayDiv.append(cardTitle);
                cardDisplayDiv.append(cardImg);
                cardDisplayDiv.append(cardTemp);
                cardDisplayDiv.append(cardHum);

            }
        });
        $("#city-input").val("");
    }

    // On click of a city in search history that will show current/5day weather again for that city
    $("#city-search-history").on("click", ".btn", function (event) {
        event.preventDefault();
        citySearch($(this).text());
    })

    getCityButtons();
    getLastCity();
});

