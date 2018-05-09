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
        console.log(res);
        const activity = app.getActivity(forecast);
        app.getPlaces(lat, lng, activity)
        //I need to get the array position from app.getweekend and pass it into forecast to get data for the closest Saturday
    });
}

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
            console.log(res);
            // app.displayPlace(place, num);
        });
}

//Get icon inside forecast\
app.getActivity = function (weatherResults) {
    const icon = weatherResults.icon;
    let activity;
    if (icon === 'clear') {
        activity = 'outDoor';
    }
    else {
        activity = 'inDoor';
    }
    return activity;  
}

// If icon === clear --> outdoor else --> indoors

//Gets current day as number between 0-6
app.getCurrDate = function () {
    const currDate = new Date;
    currDay = currDate.getDay();
    return app.getWeekend(currDay);  
}


//Gets array position of Saturday in 10 day forecast data
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


//If statement to categorize weather into indoor and outdoor activities

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
   app.userInput();
    app.getCurrDate();
}

//Document ready
$(function () {
    app.init();
});