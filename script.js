const app = {};

app.apiURL = 'https://maps.googleapis.com/maps/api/geocode/json';
app.apiURLPlaces = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
app.apiKey = 'AIzaSyB28C8y1EV7AEymUE7bT5OPoRcbDCDHnaY';

//all activities
const inDoor = ['art_gallery', 'bar', 'movie_theater', 'museum', 'restaurant', 'shopping_mall'];
const outDoor = ['amusement_park', 'campground', 'park', 'zoo'];

//max number of search results for places
// const placeResultNum = 1;

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
        app.lat = res.results[0]['geometry']['location']['lat'];
        app.lng = res.results[0]['geometry']['location']['lng'];
        app.getWeather(app.lat, app.lng, app.getWeekend(currDay));
        app.drawMap();
    });
}


//Call weather app API to get forecasted weather for location
app.getWeather = function (lat, lng, day) {
    $.ajax({
        url: `http://api.wunderground.com/api/28cbe1ca6cde9931/forecast10day/geolookup/q/${lat},${lng}.json`,
        method: 'GET',
        dataType: 'jsonp'
    }).then(res => {
        const forecast = res.forecast.txt_forecast.forecastday[app.getCurrDate()];
        console.log(forecast);
        const activity = app.getActivity(forecast);
        const locationType = app.randomPlace(activity.place);
        app.displayWeather(forecast, activity, locationType);
        app.getPlaces(lat, lng, activity, locationType);
        app.drawMap();
    });
}

//Call Google Places API and return place suggestions based on location and weather forecast
app.getPlaces = function(lat, lng, activity, locationType) {
    $.ajax({
        url: "http://proxy.hackeryou.com",
        method: "GET",
        dataType: "json",
        data: {
            reqUrl: app.apiURLPlaces,
            params: {
                key: "AIzaSyCiWIEylBJ4a0DGvCPOZnFN3WAlM1zJiJE",
                location: `${lat},${lng}`,
                // radius: 500,
                rankby: 'distance',
                type: locationType
            }
        }
    })
    .then((res) => {
        //   console.log(res);
        const place = res.results;
        app.displayPlace(place, lat, lng);
    });
}
    
    app.displayPlace = function (place, lat, lng) {
        console.log(place);

        //array that stores all the places info as an object
        let placesArray = [];
        if (place.length > 0) {
            for (let i = 0; i < place.length; i++) {
                // console.log(place[i]);
                console.log(place[i].name);
                console.log(place[i].vicinity);
                console.log(place[i].rating);
                console.log(place[i].geometry.location.lat, place[i].geometry.location.lng);

                
                //makes an array that holds all the info about the places
                let placesInfo = {};
                placesInfo = {
                    name: place[i].name,
                    address: place[i].vicinity,
                    rating: place[i].rating,
                    lat: place[i].geometry.location.lat,
                    lng: place[i].geometry.location.lng
                };

                //pushes all the info to an array
                placesArray.push(placesInfo);
            }
            
        } else {
            console.log('no results for selected place');
        }
        app.initMap(lat, lng, placesArray);
        console.log(lat, lng)
        // console.log(placeName);
    }

//Get icon inside forecast
//If statement to categorize weather into indoor and outdoor activities
// If icon === clear --> outdoor else --> indoors
app.getActivity = function (weatherResults) {
    const icon = weatherResults.icon;
    const suggestedActivity = {}
    if (icon === 'clear') {
        suggestedActivity.place = outDoor;
        suggestedActivity.text = `It's supposed to be a beautiful weekend! Get out and enjoy the sun!!`
    }
    else {
        suggestedActivity.place = inDoor;
        suggestedActivity.text = `404 sun not found. Maybe do something indoors.`
    }
    return suggestedActivity;
}

//get the random places from indoor : outdoor activities
app.randomPlace = function (array) {
    let rdnNum = Math.floor(Math.random() * array.length);
    console.log(array[rdnNum]);
    const placeType = array[rdnNum];
    return placeType;
}

//setup google map
app.drawMap = function() {
    //google map script
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCiWIEylBJ4a0DGvCPOZnFN3WAlM1zJiJE";
    document.body.appendChild(script);
}


//creates google map
app.initMap = function (latNew, lngNew, placesInfo) {
    var selectedPlace = { lat: latNew, lng: lngNew };
    console.log(selectedPlace);
    var map = new google.maps.Map(document.getElementById('map'), {
        // zoom: 15,
        center: selectedPlace
    });

    var yourLocation = new google.maps.Marker({
        position: {lat: latNew, lng: lngNew},
        map: map,
        icon: 'assets/People_Location-512.png'
    })

    
    //information window for each marker
    var infowindow = new google.maps.InfoWindow();
    
    var marker, i;
    let markers = [];
    markers.push(yourLocation);

    //loops through all the places
    for (i = 0; i < placesInfo.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(placesInfo[i].lat, placesInfo[i].lng),
            map: map
        });
        markers.push(marker);

        //loops though array of markers and gets position to set bounds of map
        const bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < markers.length; i++) {
            bounds.extend(markers[i].getPosition());
        }

        map.fitBounds(bounds);

        //event listener for displaying infowindow on click of the markers
        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infowindow.setContent(`<p>Name: ${placesInfo[i].name}</p> <p>Address: ${placesInfo[i].address}</p> <p>Rating: ${placesInfo[i].rating}</p>`);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }   
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
app.displayWeather = function (dayForecast, activitySuggestion, locationType) {
    $('.user-input').hide(); // hide search container
    $('.response').fadeIn(); // show results container

    $('.suggested-activity').empty(); // empty suggested activity if location searched again
    //Store forecast content and then append to container
    const $icon = $('<img>').attr('src', dayForecast.icon_url);
    const $forecastText = $('<h2>').text(dayForecast.fcttext_metric);
    const $activity = $('<p>').text(activitySuggestion.text);
    const $activityType = $('<p>').text(`Here are some nearby ${locationType.replace(/_/, ' ')}s!`);
    const $activityContainer = $('<div>').append($icon, $forecastText, $activity, $activityType);
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

app.drawMap = function () {
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCiWIEylBJ4a0DGvCPOZnFN3WAlM1zJiJE";
    document.body.appendChild(script);
}

//Document ready
$(function () {
    app.init();
});