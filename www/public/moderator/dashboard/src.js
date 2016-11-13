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

    setBarChartClickEvent();
}

function loadDashboardData(){
    // get all dashboard data
    $.ajax({
        method: 'GET',
        url: '/moderator/!/alldashboarddata',
        success: function(data, status, xhr){
            if(data.status===1){
                dashboardData = data.data;
                $('#totalcount').html(dashboardData.allreportltlng.length);
                $('#assignedcount').html(dashboardData.assignedreportltlng.length);
                $('#returnedcount').html(dashboardData.returnedreportltlng.length);
                $('#rejectedcount').html(dashboardData.rejectedreportltlng.length);

                // load marker
                reloadMarkers(dashboardData.allreportltlng);

                // filter change event
                $('#dashboard-maps-filter').off('change');
                $('#dashboard-maps-filter').on('change', function(){
                    var selection = $(this).val();
                    switch (selection){
                        case 'All Reports':
                            reloadMarkers(dashboardData.allreportltlng);
                            break;
                        case 'Pending Reports':
                            reloadMarkers(dashboardData.unassignedreportltlng);
                            break;
                        case 'Report On Progress':
                            reloadMarkers(dashboardData.assignedreportltlng);
                            break;
                        case 'Finished':
                            reloadMarkers([]); //TODO: belum dibuat query yg laporan selesai
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
            console.log(data);
            
        },
        error: function(xhr, status, err){

        }
    });
}

function setDetailButtonEvent(){
    // event tombol detail
    $('a[detailbtn]').off('click');
    $('a[detailbtn]').on('click', function(){
        var title = $(this).children().last().children().last().html();
        modal.setTitle('Detail ' + title);
        modal.setBody('<div id="pie-detail"></div>').show();

        // pie chart
        setTimeout(function(){
            c3.generate({
                bindto: '#pie-detail',
                data:{
                    columns: [
                        ['General', 30],
                        ['Traffic', 120],
                        ['Health', 68]
                    ],
                    colors:{
                        //data1: '#1ab394',
                        //data2: '#BABABA'
                    },
                    type : 'pie'
                },
                pie: {
                    label: {
                        format: function(value, ratio, id) {
                            return value;
                      }
                    }
                }
            });
            console.log("rendered");
        }, 300);
        // pie chart done
        modal.$buttons.OK.off("click");
        modal.$buttons.OK.on("click", function () {
            console.log("olalaaaa");
        });
    });
}

function setBarChartClickEvent(){
    $("#flot-bar-chart").bind("plotclick", function (event, pos, item) {
        console.log(item);

        modal.setTitle("Monthly Report Detail");

        if(item.datapoint[1] === 0){
            modal.setBody('<div>No report found in '+monthNameList[item.dataIndex]+'.</div>').show(); 
            modal.$buttons.OK.off("click");
            modal.$buttons.OK.on("click", function () {    
            });   
        } else {
            var modalBody = '<h2>List all reports in '+monthNameList[item.dataIndex]+'</h2>'+
                                '<table id="monthly-list-report" class="table-responsive table table-striped table-bordered table-hover">'+
                                    '<thead>'+
                                        '<tr>'+
                                            '<th hidden>ID</th>'+
                                            '<th>Title</th>'+
                                            '<th>Description</th>'+
                                            '<th>Author</th>'+
                                            '<th>Date</th>'+
                                            '<th>Detail</th>'+
                                        '</tr>'+
                                    '</thead>'+
                                    '<tbody>'+
                                        '<tr><td colspan=5><h3>Loading data..</h3></td></tr>'+
                                    '</tbody>'+
                                '</table>';
            modal.setBody(modalBody).show();
            // get report list in specific month
            $.ajax({
                url:'/moderator/!/monthlyreports?m=' + item.dataIndex,
                success: function(data, status, xhr){
                    console.log(data);

                    if(data.status === 1){
                        var reportdata = data.data;
                        var tabelRows = '';
                        for(i=0; i<reportdata.length; i++){
                            var reportTitle = 'Untitled Report';
                            if(reportdata[i].hasOwnProperty('title')){
                                reportTitle = reportdata[i].title;
                            }
                            tabelRows += '<tr>'+
                                            '<td>'+ reportdata[i]._id +'</td>'+
                                            '<td>'+ reportTitle +'</td>'+
                                            '<td>'+ reportdata[i].text +'</td>'+
                                            '<td>'+ reportdata[i].users._id.name.first +'</td>'+
                                            '<td>'+ reportdata[i].createdAt.substr(0, reportdata[i].createdAt.indexOf('T')) + " " + reportdata[i].createdAt.substr(reportdata[i].createdAt.indexOf('T')+1, 8) +'</td>'+
                                            '<td><a class="btn btn-primary btn-duplicate"><span class="glyphicon glyphicon-search"></span></a></td>'+
                                        '</tr>';
                        }

                        $('#monthly-list-report tbody').html(tabelRows);

                        $('#monthly-list-report').DataTable({
                            "columnDefs": [
                                {
                                    "targets": 0,
                                    "visible": false,
                                    "searchable": false
                                }
                            ]
                        } );

                        $( "#monthly-list-report tbody" ).on( "click", "tr", function() {
                            //console.log( $( this ).text() );
                            var data = $('#monthly-list-report').dataTable().fnGetData(this);
                            console.log(data);
                        });
                    } else {
                        alert('failed to get monthly report');
                    }
                },
                error: function(xhr, status, err){
                    //TODO
                    console.log(err);
                }
            });
            // init datatables
        }

        modal.$buttons.OK.off("click");
        modal.$buttons.OK.on("click", function () {    
        });

    });
}

function initMap(){
    var bandung = {lat: -6.909920, lng: 107.608136}; //TODO: do not hardcode. cari dari organizations._id
    map = new google.maps.Map($('#dashboard-maps')[0], {
        zoom: 12,
        center: bandung
    });
}

$(document).ready(function(){
   
   initMap();

   loadDashboardData();

   setDetailButtonEvent();
});