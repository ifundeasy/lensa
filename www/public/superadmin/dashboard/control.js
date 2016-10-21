$(document).ready(function () {
    var donut = $("#doughnutChart1");
    donut.height(donut.parent().height());
    donut.width(donut.parent().width());
    //
    function gd(year, month, day) {
        return new Date(year, month - 1, day).getTime();
    }

    var data2 = [
        [gd(2012, 1, 1), 7], [gd(2012, 1, 2), 6], [gd(2012, 1, 3), 4], [gd(2012, 1, 4), 8],
        [gd(2012, 1, 5), 9], [gd(2012, 1, 6), 7], [gd(2012, 1, 7), 5], [gd(2012, 1, 8), 4],
        [gd(2012, 1, 9), 7], [gd(2012, 1, 10), 8], [gd(2012, 1, 11), 9], [gd(2012, 1, 12), 6],
        [gd(2012, 1, 13), 4], [gd(2012, 1, 14), 5], [gd(2012, 1, 15), 11], [gd(2012, 1, 16), 8],
        [gd(2012, 1, 17), 8], [gd(2012, 1, 18), 11], [gd(2012, 1, 19), 11], [gd(2012, 1, 20), 6],
        [gd(2012, 1, 21), 6], [gd(2012, 1, 22), 8], [gd(2012, 1, 23), 11], [gd(2012, 1, 24), 13],
        [gd(2012, 1, 25), 7], [gd(2012, 1, 26), 9], [gd(2012, 1, 27), 9], [gd(2012, 1, 28), 8],
        [gd(2012, 1, 29), 5], [gd(2012, 1, 30), 8], [gd(2012, 1, 31), 25]
    ];
    var data3 = [
        [gd(2012, 1, 1), 800], [gd(2012, 1, 2), 500], [gd(2012, 1, 3), 600], [gd(2012, 1, 4), 700],
        [gd(2012, 1, 5), 500], [gd(2012, 1, 6), 456], [gd(2012, 1, 7), 800], [gd(2012, 1, 8), 589],
        [gd(2012, 1, 9), 467], [gd(2012, 1, 10), 876], [gd(2012, 1, 11), 689], [gd(2012, 1, 12), 700],
        [gd(2012, 1, 13), 500], [gd(2012, 1, 14), 600], [gd(2012, 1, 15), 700], [gd(2012, 1, 16), 786],
        [gd(2012, 1, 17), 345], [gd(2012, 1, 18), 888], [gd(2012, 1, 19), 888], [gd(2012, 1, 20), 888],
        [gd(2012, 1, 21), 987], [gd(2012, 1, 22), 444], [gd(2012, 1, 23), 999], [gd(2012, 1, 24), 567],
        [gd(2012, 1, 25), 786], [gd(2012, 1, 26), 666], [gd(2012, 1, 27), 888], [gd(2012, 1, 28), 900],
        [gd(2012, 1, 29), 178], [gd(2012, 1, 30), 555], [gd(2012, 1, 31), 993]
    ];
    var dataset = [
        {
            label : "Number of orders",
            data : data3,
            color : "#1ab394",
            bars : {
                show : true,
                align : "center",
                barWidth : 24 * 60 * 60 * 600,
                lineWidth : 0
            }
        }, {
            label : "Payments",
            data : data2,
            yaxis : 2,
            color : "#1C84C6",
            lines : {
                lineWidth : 1,
                show : true,
                fill : true,
                fillColor : {
                    colors : [{
                        opacity : 0.2
                    }, {
                        opacity : 0.4
                    }]
                }
            },
            splines : {
                show : false,
                tension : 0.6,
                lineWidth : 1,
                fill : 0.1
            },
        }
    ];
    var options = {
        xaxis : {
            mode : "time",
            tickSize : [3, "day"],
            tickLength : 0,
            axisLabel : "Date",
            axisLabelUseCanvas : true,
            axisLabelFontSizePixels : 12,
            axisLabelFontFamily : 'Arial',
            axisLabelPadding : 10,
            color : "#d5d5d5"
        },
        yaxes : [{
            position : "left",
            max : 1070,
            color : "#d5d5d5",
            axisLabelUseCanvas : true,
            axisLabelFontSizePixels : 12,
            axisLabelFontFamily : 'Arial',
            axisLabelPadding : 3
        }, {
            position : "right",
            clolor : "#d5d5d5",
            axisLabelUseCanvas : true,
            axisLabelFontSizePixels : 12,
            axisLabelFontFamily : ' Arial',
            axisLabelPadding : 67
        }
        ],
        legend : {
            noColumns : 1,
            labelBoxBorderColor : "#000000",
            position : "nw"
        },
        grid : {
            hoverable : false,
            borderWidth : 0
        }
    };
    var doughnutData1 = {
        labels : ["Done", "Progress", "Accepted", "Refuse"],
        datasets : [{
            data : [586, 340, 723, 434],
            backgroundColor : ["#a3e1d4", "#dedede", "#9CC3DA", "green", "red"]
        }]
    };
    var doughnutOptions1 = {
        responsive : true,
        legend : {
            display : false
        }
    };
    var ctx1 = document.getElementById("doughnutChart1").getContext("2d");
    new Chart(ctx1, {type : 'doughnut', data : doughnutData1, options : doughnutOptions1});
    $.plot($("#flot-dashboard-chart"), dataset, options);
    //
    googlemaps(function (gmaps) {
        var map = new gmaps.Map(document.getElementById('map'), {
            center : {lat : -1.1437534, lng : 120.9636005},
            zoom : 4
        });
        googlemaps.getMyLocation(function (e, position) {
            var infoWindow = new gmaps.InfoWindow({map : map});
            if (!e) {
                infoWindow.setPosition(position);
                infoWindow.setContent('Location found.');
                map.setCenter(position);
                map.setZoom(9);
            } else {
                var fakepos = map.getCenter(position);
                infoWindow.setPosition(fakepos);
                infoWindow.setContent(e);
            }
        })
    })
});