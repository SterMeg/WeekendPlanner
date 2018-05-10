const app = {};

app.apiURL = 'https://maps.googleapis.com/maps/api/geocode/json';
app.apiURLPlaces = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
app.apiKey = 'AIzaSyB28C8y1EV7AEymUE7bT5OPoRcbDCDHnaY';

//Call Google API geocode
//Get coordinates from inputted address
app.getLocation = function (locationInput) {
    $.ajax({
        url: "http://proxy.hackeryou.com",
        method: "GET",
        dataType: "json",
        data: {
            reqUrl: app.apiURL,
            params: {
                key: app.apiKey,
                address: locationInput
            }
        }
    }).then(res => {
        console.log(res);
        const lat = res.results[0]['geometry']['location']['lat'];
        const lng = res.results[0]['geometry']['location']['lng'];
        app.getWeather(lat, lng);
    });
}


//Call weather app API to get forecasted weather for location
app.getWeather = function (lat, lng) {
    $.ajax({
        url: `http://api.wunderground.com/api/28cbe1ca6cde9931/forecast10day/geolookup/q/${lat},${lng}.json`,
        method: 'GET',
        dataType: 'jsonp'
    }).then(res => {
        const forecast = res.forecast.txt_forecast.forecastday[app.getCurrDate()];
        console.log(forecast);
        const activity = app.getActivity(forecast);
        app.displayWeather(forecast, activity);
        app.getPlaces(lat, lng, activity);
    });
}

//Call Google Places API and return place suggestions based on location and weather forecast
app.getPlaces = function(lat, lng, activity) {
    $.ajax({
        url: "http://proxy.hackeryou.com",
        method: "GET",
        dataType: "json",
        data: {
            reqUrl: app.apiURLPlaces,
            params: {
                key: "AIzaSyCiWIEylBJ4a0DGvCPOZnFN3WAlM1zJiJE",
                location: `${lat},${lng}`,
                radius: 500,
                type: 'restaurant'
            }
        }
    })
        .then((res) => {
            //   console.log(res);
            const place = res.results;
            // console.log(res);
            // app.displayPlace(place, num);
        });
}

//Get icon inside forecast
//If statement to categorize weather into indoor and outdoor activities
// If icon === clear --> outdoor else --> indoors
app.getActivity = function (weatherResults) {
    const icon = weatherResults.icon;
    const suggestedActivity = {}
    if (icon === 'clear') {
        suggestedActivity.place = 'outDoor';
        suggestedActivity.text = `It's supposed to be a beautiful weekend! Get out and enjoy the sun!!`
    }
    else {
        suggestedActivity.place = 'inDoor';
        suggestedActivity.text = `404 sun not found. Maybe do something indoors.`
    }
    return suggestedActivity;
}

//Gets current day as number between 0-6
app.getCurrDate = function () {
    const currDate = new Date;
    currDay = currDate.getDay();
    return app.getWeekend(currDay);  
}


// Takes current day and gets array position of Saturday in 10 day forecast data
app.getWeekend = function(day) {
    let arrayPos = 0;
    switch (day) {
        case 0:
            arrayPos = 12;
            break;
        case 1:
            arrayPos = 10;
            break;
        case 2:
            arrayPos = 8;
            break;
        case 3:
            arrayPos = 6;
            break;
        case 4:
            arrayPos = 4;
            break;
        case 5:
            arrayPos = 2;
            break;
        case 6:
            arrayPos = 0;
            break;
    } 
    return arrayPos;
}

//Get weather forecast and icon and assign to variables to append to DOM
app.displayWeather = function (dayForecast, activitySuggestion) {
    $('.user-input').hide(); // hide search container
    $('.response').fadeIn(); // show results container

    $('.suggested-activity').empty(); // empty suggested activity if location searched again

    //Store forecast content and then append to container
    const $icon = $('<img>').attr('src', dayForecast.icon_url);
    const $forecastText = $('<h2>').text(dayForecast.fcttext_metric);
    const $activity = $('<p>').text(activitySuggestion.text);
    const $activityContainer = $('<div>').append($icon, $forecastText, $activity);
    $('.suggested-activity').append($activityContainer);
}


//Get user input on their location
app.userInput = function () {
    $('form').on('submit', function(e){
        e.preventDefault();
        const locationInput = $('input[type=text]').val();
        app.getLocation(locationInput);        
    }); 
}


//Initialize app
app.init = function () {
    $('.response').hide();
    app.userInput();
    app.getCurrDate();
}

//Document ready
$(function () {
    app.init();
});