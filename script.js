let app = {};

app.apiURL = 'https://maps.googleapis.com/maps/api/geocode/json';
app.apiKey = 'AIzaSyB28C8y1EV7AEymUE7bT5OPoRcbDCDHnaY';


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
        app.lat = res.results[0]['geometry']['location']['lat'];
        app.lng = res.results[0]['geometry']['location']['lng'];
    });
}

app.userInput = function () {
    $('form').on('submit', function(e){
        e.preventDefault();
        const locationInput = $('input[type=text]').val();
        app.getLocation(locationInput);        
    }); 
}


app.init = function () {
   app.userInput();
}


$(function () {
    app.init();
});
