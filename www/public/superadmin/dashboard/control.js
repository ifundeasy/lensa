//https://wrightshq.com/playground/placing-multiple-markers-on-a-google-map-using-api-3/
//https://developers.google.com/maps/documentation/javascript/marker-clustering#try-it-yourself
$(document).ready(function () {
    var donut = $("#doughnutChart1");
    donut.height(donut.parent().height());
    donut.width(donut.parent().width());
    //
    function gd(year, month, day) {
        return new Date(year, month - 1, day).getTime();
    }
    var exposureDataset = [
        {
            label: "Number of orders",
            data: [
                [gd(2012, 1, 1), 800], [gd(2012, 1, 2), 500], [gd(2012, 1, 3), 600], [gd(2012, 1, 4), 700],
                [gd(2012, 1, 5), 500], [gd(2012, 1, 6), 456], [gd(2012, 1, 7), 800], [gd(2012, 1, 8), 589],
                [gd(2012, 1, 9), 467], [gd(2012, 1, 10), 876], [gd(2012, 1, 11), 689], [gd(2012, 1, 12), 700],
                [gd(2012, 1, 13), 500], [gd(2012, 1, 14), 600], [gd(2012, 1, 15), 700], [gd(2012, 1, 16), 786],
                [gd(2012, 1, 17), 345], [gd(2012, 1, 18), 888], [gd(2012, 1, 19), 888], [gd(2012, 1, 20), 888],
                [gd(2012, 1, 21), 987], [gd(2012, 1, 22), 444], [gd(2012, 1, 23), 999], [gd(2012, 1, 24), 567],
                [gd(2012, 1, 25), 786], [gd(2012, 1, 26), 666], [gd(2012, 1, 27), 888], [gd(2012, 1, 28), 900],
                [gd(2012, 1, 29), 178], [gd(2012, 1, 30), 555], [gd(2012, 1, 31), 993]
            ],
            color: "#1ab394",
            bars: {
                show: true,
                align: "center",
                barWidth: 24 * 60 * 60 * 600,
                lineWidth: 0
            }
        },
        {
            label: "Payments",
            data: [
                [gd(2012, 1, 1), 7], [gd(2012, 1, 2), 6], [gd(2012, 1, 3), 4], [gd(2012, 1, 4), 8],
                [gd(2012, 1, 5), 9], [gd(2012, 1, 6), 7], [gd(2012, 1, 7), 5], [gd(2012, 1, 8), 4],
                [gd(2012, 1, 9), 7], [gd(2012, 1, 10), 8], [gd(2012, 1, 11), 9], [gd(2012, 1, 12), 6],
                [gd(2012, 1, 13), 4], [gd(2012, 1, 14), 5], [gd(2012, 1, 15), 11], [gd(2012, 1, 16), 8],
                [gd(2012, 1, 17), 8], [gd(2012, 1, 18), 11], [gd(2012, 1, 19), 11], [gd(2012, 1, 20), 6],
                [gd(2012, 1, 21), 6], [gd(2012, 1, 22), 8], [gd(2012, 1, 23), 11], [gd(2012, 1, 24), 13],
                [gd(2012, 1, 25), 7], [gd(2012, 1, 26), 9], [gd(2012, 1, 27), 9], [gd(2012, 1, 28), 8],
                [gd(2012, 1, 29), 5], [gd(2012, 1, 30), 8], [gd(2012, 1, 31), 25]
            ],
            yaxis: 2,
            color: "#1C84C6",
            lines: {
                lineWidth: 1,
                show: true,
                fill: true,
                fillColor: {
                    colors: [{
                        opacity: 0.2
                    }, {
                        opacity: 0.4
                    }]
                }
            },
            splines: {
                show: false,
                tension: 0.6,
                lineWidth: 1,
                fill: 0.1
            },
        }
    ];
    var exposureOpts = {
        xaxis: {
            mode: "time",
            tickSize: [3, "day"],
            tickLength: 0,
            axisLabel: "Date",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Arial',
            axisLabelPadding: 10,
            color: "#d5d5d5"
        },
        yaxes: [{
                position: "left",
                max: 1070,
                color: "#d5d5d5",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Arial',
                axisLabelPadding: 3
        }, {
                position: "right",
                clolor: "#d5d5d5",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: ' Arial',
                axisLabelPadding: 67
        }
        ],
        legend: {
            noColumns: 1,
            labelBoxBorderColor: "#000000",
            position: "nw"
        },
        grid: {
            hoverable: false,
            borderWidth: 0
        }
    };
    var kpiDataset = [
        {
            label: "Time limits",
            data: [
                ["Initial", 800],
                ["Step #2", 500],
                ["Step #3", 600],
                ["Step #4", 200],
                ["Finishing", 1270]
            ],
            color: "#1ab394",
            bars: {
                show: true,
                align: "center",
                barWidth: 0.8,
                lineWidth: 0
            }
        },
        {
            label: "Average time",
            data: [
                ["Initial", 600],
                ["Step #2", 333],
                ["Step #3", 400],
                ["Step #4", 111],
                ["Finishing", 970]
            ],
            yaxis: 2,
            color: "#1C84C6",
            lines: {
                lineWidth: 1,
                show: true,
                fill: true,
                fillColor: {
                    colors: [{
                        opacity: 0.2
                    }, {
                        opacity: 0.4
                    }]
                }
            },
            splines: {
                show: false,
                tension: 0.6,
                lineWidth: 1,
                fill: 0.1
            },
        }
    ];
    var kpiOpts = {
        xaxis: {
            mode: "categories",
            tickLength: 0,
            axisLabel: "Checkpoint",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Arial',
            axisLabelPadding: 10,
            color: "#d5d5d5"
        },
        yaxes: [
            {
                position: "left",
                max: 1270,
                color: "#d5d5d5",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Arial',
                axisLabelPadding: 3
            },
            {
                position: "right",
                clolor: "#d5d5d5",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: ' Arial',
                axisLabelPadding: 67
            }
        ],
        yaxes: {
            position: "left",
            max: 1270,
            color: "#d5d5d5",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Arial',
            axisLabelPadding: 3
        },
        legend: {
            noColumns: 1,
            labelBoxBorderColor: "#000000",
            position: "nw"
        },
        grid: {
            hoverable: false,
            borderWidth: 0
        }
    };
    var doughnutData1 = {
        labels: ["Done", "Progress", "Accepted", "Refuse"],
        datasets: [{
            data: [586, 340, 723, 434],
            backgroundColor: ["#a3e1d4", "#dedede", "#9CC3DA", "green", "red"]
        }]
    };
    var doughnutOptions1 = {
        responsive: true,
        legend: {
            display: false
        }
    };
    var ctx1 = document.getElementById("doughnutChart1").getContext("2d");
    new Chart(ctx1, {
        type: 'doughnut',
        data: doughnutData1,
        options: doughnutOptions1
    });
    $.plot($("#exposure-chart"), exposureDataset, exposureOpts);
    $.plot($("#kpi-chart"), kpiDataset, kpiOpts);
    //
    googlemaps(function (gmaps) {
        var infoWindow;
        var markers = [];
        var bounds = new gmaps.LatLngBounds();
        var map = new gmaps.Map(document.getElementById('map'), {
            center: {
                lat: -1.1437534,
                lng: 120.9636005
            },
            zoom: 4,
            mapTypeId: 'roadmap',
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'terrain'],
                style: gmaps.MapTypeControlStyle.DROPDOWN_MENU
            }
        });

        var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
        var icons = {
            parking: {
                name: 'Parking',
                icon: iconBase + 'parking_lot_maps.png'
            },
            library: {
                name: 'Library',
                icon: iconBase + 'library_maps.png'
            },
            info: {
                name: 'Info',
                icon: iconBase + 'info-i_maps.png'
            }
        };

        function addMarker(feature, i) {
            var marker = new gmaps.Marker({
                position: feature.position,
                label: icons[feature.type].name,
                icon: icons[feature.type].icon,
                map: map
            });
            markers.push(marker);
            gmaps.event.addListener(marker, 'click', (function(marker) {
                return function() {
                    infoWindow.setContent(icons[feature.type].name);
                    infoWindow.open(map, marker);
                }
            })(marker));
            map.fitBounds(bounds);
        }
        var features = [
            {
                position: new gmaps.LatLng(-6.896669, 107.612872),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.8966637,107.6106833),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.8966637,107.6106833),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.8966637,107.6106833),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.8966637,107.6106833),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.8984318,107.60861269),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.9032248,107.6155649),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.9007537,107.6186548),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.9349372,107.6973459),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.9349372,107.6973459),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.9349372,107.6973459),
                type: 'info'
            }, {
                position: new gmaps.LatLng(-6.9363005,107.7056393),
                type: 'parking'
            }, {
                position: new gmaps.LatLng(-6.9388352,107.7098128),
                type: 'parking'
            }, {
                position: new gmaps.LatLng(-6.9417001,107.7145657),
                type: 'parking'
            }, {
                position: new gmaps.LatLng(-6.947398,107.7183744),
                type: 'parking'
            }, {
                position: new gmaps.LatLng(-6.9511038,107.7244762),
                type: 'parking'
            }, {
                position: new gmaps.LatLng(-6.9532915,107.7356586),
                type: 'parking'
            }, {
                position: new gmaps.LatLng(-6.9462732,107.7451858),
                type: 'parking'
            }, {
                position: new gmaps.LatLng(-6.9417895,107.7480504),
                type: 'library'
            }
        ];

        var legend = document.getElementById('legend');
        for (var key in icons) {
            var type = icons[key];
            var name = type.name;
            var icon = type.icon;
            var div = document.createElement('div');
            div.innerHTML = '<img src="' + icon + '"><span> ' + name + '</span>';
            legend.appendChild(div);
        }
        map.controls[gmaps.ControlPosition.RIGHT_BOTTOM].push(legend);
        googlemaps.getMyLocation(function (e, position) {
            infoWindow = new gmaps.InfoWindow({
                map: map
            });
            if (!e) {
                infoWindow.setPosition(position);
                infoWindow.setContent('You\'re here');
                map.setCenter(position);
                map.setZoom(9);
            } else {
                var fakepos = map.getCenter(position);
                infoWindow.setPosition(fakepos);
                infoWindow.setContent(e);
            }

            for (var i = 0, feature; feature = features[i]; i++) {
                bounds.extend(feature.position);
                addMarker(feature, i);
            }
            new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
        })
    })
});
