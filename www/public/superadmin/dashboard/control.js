//https://wrightshq.com/playground/placing-multiple-markers-on-a-google-map-using-api-3/
//https://developers.google.com/maps/documentation/javascript/marker-clustering#try-it-yourself
var dashboardData = {};
var markers = [];
var map = '';
var monthNameList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// modal detail 
var modal = new Modal({
    title : "Prompt",
    backdrop : true,
    handler : {
        OK : {class : "btn-success"},
        Cancel : {class : "btn-default", dismiss : true}
    }
});
var modal2 = new Modal({
    title : "Prompt",
    backdrop : true,
    handler : {
        OK : {class : "btn-success"},
        Cancel : {class : "btn-default", dismiss : true}
    }
});
var modal3 = new Modal({
    title : "Prompt",
    backdrop : true,
    handler : {
        OK : {class : "btn-success"},
        Cancel : {class : "btn-default", dismiss : true}
    }
});

function initMap(){
    var bandung = {lat: -6.909920, lng: 107.608136}; //TODO: do not hardcode. cari dari organizations._id
    map = new google.maps.Map($('#dashboard-maps')[0], {
        zoom: 12,
        center: bandung
    });
}

function reloadMarkers(latLongArray){
    for (var x = 0; x < markers.length; x++) {
        markers[x].setMap(null);
    }
    markers = [];

    for(var i = 0; i<latLongArray.length; i++){
        var newLatLong = new google.maps.LatLng(latLongArray[i].lat, latLongArray[i].long);
        var newMarker = new google.maps.Marker({
            position: newLatLong,
            map: map,
            icon: '/img/pin.png',
            name: latLongArray[i].text.substring(0, 100)
        });
        
        google.maps.event.addListener(newMarker, 'click', function() {
            //$('#myModal').modal('show'); //TODO: buat modalnya yaaaaaaa
        });
        markers.push(newMarker);
    }
}

function initMonthlyBarChart(_data){
    // bar chart, flot library
    var barOptions = {
        series: {
            bars: {
                show: true,
                barWidth: 0.6,
                fill: true,
                fillColor: {
                    colors: [{
                        opacity: 0.8
                    }, {
                        opacity: 0.8
                    }]
                }
            }
        },
        xaxis: {
            axisLabel: "Month",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 10,
            ticks: [[0, "Jan"], [1, "Feb"], [2, "Mar"], [3, "Apr"],[4, "May"], [5, "Jun"], [6, "Jul"], [7, "Aug"], [8, "Sep"], [9, "Oct"], [10, "Nov"], [11, "Des"]]
        },
        yaxis: {
            axisLabel: "Report count",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 3,
            minTickSize: 1,
            tickFormatter: function (v, axis) {
                return v + "";
            }
        },
        colors: ["#1ab394"],
        grid: {
            color: "#999999",
            hoverable: true,
            clickable: true,
            tickColor: "#D4D4D4",
            borderWidth:0
        },
        legend: {
            show: false
        },
        tooltip: true,
        tooltipOpts: {
            content: "%y report(s)"
        }
    };
    var barData = {
        label: "bar",
        //data: [[0, 11],[1, 15],[2, 25],[3, 24],[4, 13],[5, 18], [6, 27], [7, 42], [8, 35], [9, 31], [10, 25], [11, 21]]
        data: _data    
    };
    $.plot($("#flot-bar-chart"), [barData], barOptions);

    //setBarChartClickEvent();
    console.log("rendered");
    console.log(_data);
}

function loadDashboardData(){
    $.ajax({
        url: '/superadmin/!/alldashboarddata',
        success: function(data, status, xhr){
            if(data.status==1){
                dashboardData = data.data;
                console.log(dashboardData);
                $('#done-count').html(dashboardData.finishedreportltlng.length);
                var donePercent = dashboardData.finishedreportltlng.length/dashboardData.allreportltlng.length * 100;
                $('#done-count').next().html(truncateDecimals(donePercent, 1) + ' %');
                
                $('#progress-count').html(dashboardData.onprogressreportltlng.length);
                var progressPercent = dashboardData.onprogressreportltlng.length/dashboardData.allreportltlng.length * 100;
                $('#progress-count').next().html(truncateDecimals(progressPercent, 1) + ' %');
                
                $('#accepted-count').html(dashboardData.acceptedreportltlng.length);
                var acceptedPercent = dashboardData.acceptedreportltlng.length/dashboardData.allreportltlng.length * 100;
                $('#accepted-count').next().html(truncateDecimals(acceptedPercent, 1) + ' %');
                
                $('#rejected-count').html(dashboardData.rejectedreportltlng.length);
                var rejectedPercent = dashboardData.rejectedreportltlng.length/dashboardData.allreportltlng.length * 100;
                $('#rejected-count').next().html(truncateDecimals(rejectedPercent, 1) + ' %');
                
                $('#top-entities-list').html('');
                var entitiesEl = '';
                for(i=0; i<dashboardData.categoryagg.length; i++){
                    var catName = 'unassigned';
                    if(dashboardData.categoryagg[i]._id != null){
                        catName = dashboardData.categoryagg[i].category[0].name;
                    }
                    entitiesEl += '<div class="col-sm-12" style="padding-top: 10px">'+
                                        '<h4 class="pull-left" style="">'+catName+'</h4>'+
                                        '<div class="pull-right text-right">'+
                                            '<span class="bar_dashboard">5,3,9,6,5,9,7,3,5,2,4,7,3,2,7,9,6,4,5,7,3,2,1,0,9,5,6,8,3,2,1</span>'+
                                            '<br />'+
                                            '<small class="font-bold">'+dashboardData.categoryagg[i].sum+'</small>'+
                                        '</div>'+
                                    '</div>';
                }
                
                $('#top-entities-list').html(entitiesEl);
                
                // just reassign peity style
                $("span.pie").peity("pie", {
                    fill: ['#1ab394', '#d7d7d7', '#ffffff']
                })
            
                $(".line").peity("line",{
                    fill: '#1ab394',
                    stroke:'#169c81',
                })
            
                $(".bar").peity("bar", {
                    fill: ["#1ab394", "#d7d7d7"]
                })
            
                $(".bar_dashboard").peity("bar", {
                    fill: ["#1ab394", "#d7d7d7"],
                    width:100
                })
            
                var updatingChart = $(".updating-chart").peity("line", { fill: '#1ab394',stroke:'#169c81', width: 64 })
            
                setInterval(function() {
                    var random = Math.round(Math.random() * 10)
                    var values = updatingChart.text().split(",")
                    values.shift()
                    values.push(random)
            
                    updatingChart
                        .text(values.join(","))
                        .change()
                }, 1000);
                // just reassign peity style --end
                
                // load marker
                reloadMarkers(dashboardData.allreportltlng);
                
                // filter change event
                $('#dashboard-maps-filter').off('change');
                $('#dashboard-maps-filter').on('change', function(){
                    var selection = $(this).val();
                    switch (selection){
                        case 'All reports':
                            reloadMarkers(dashboardData.allreportltlng);
                            break;
                        case 'Done':
                            reloadMarkers(dashboardData.finishedreportltlng);
                            break;
                        case 'Progress':
                            reloadMarkers(dashboardData.onprogressreportltlng);
                            break;
                        case 'Accepted':
                            reloadMarkers(dashboardData.acceptedreportltlng);
                            break;
                        case 'Rejected':
                            reloadMarkers(dashboardData.rejectedreportltlng);
                            break;
                    }
                    console.log("changed");

                });
                
                //init bar chart for monthly reports
                var barchartdata = [];
                for(i=0; i<12; i++){
                    barchartdata.push([i, dashboardData.monthlyreports[i].sum]);
                }
                initMonthlyBarChart(barchartdata);
                
            } else {
                var r = confirm("Failed to load dashboard data. reload page?");
                if (r == true) {
                    location.reload();   
                }
            }
        },
        error: function(xhr, status, err){
            
        }
    });
    
}

function truncateDecimals (number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

$(document).ready(function () {
    
    initMap();
    loadDashboardData();
 
    
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


    $.plot($("#kpi-chart"), kpiDataset, kpiOpts);
    //
    
});
