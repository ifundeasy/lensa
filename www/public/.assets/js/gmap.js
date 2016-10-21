(function () {
    var apiKey = "AIzaSyCaOHC86utSk60KvQg1ZMf98gA5eyLiLfk";
    var start = true,
        scripts = document.getElementsByTagName('script'),
        src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&callback=';
    for (var f = 0; f < scripts.length; f++) {
        if (scripts[f].src.indexOf(src) !== -1) {
            start = false;
            break;
        }
    }
    if (start) {
        var time = (new Date()).getTime().toString(36);
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = src + time;
        script.setAttribute("async", "");
        script.setAttribute("defer", "");
        document.getElementsByTagName("head")[0].appendChild(script);
        window[time] = function () {
            window.googlemaps = function (cb) {
                var me = this;
                var i = 0, z = setInterval(function () {
                    if (window.google || (i > 10)) {
                        i = 0;
                        clearInterval(z);
                        if (window.google) {
                            return cb(google.maps);
                        } else console.error("Failed loading google maps resource!")
                    }
                    i++;
                }, 200)
            };
            window.googlemaps.getMyLocation = function (cb) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        cb(null, {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        })
                    }, function() {
                        cb('Error: The Geolocation service failed.')
                    });
                } else {
                    cb('Error: Your browser doesn\'t support geolocation.')
                }
            }
        };
        window[time]();
    }
})();