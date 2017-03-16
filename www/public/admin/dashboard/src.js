var dashboardData = {};
var markers = [];
var map = '';
var monthNameList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var orglat = 0;
var orglong = 0;

// modal detail 
var modal = new Modal({
    title : "Prompt",
    id: 'modal-chrt',
    backdrop : true,
    handler : {
        OK : {class : "btn-success"},
        Cancel : {class : "btn-default", dismiss : true}
    }
});
var modalselector = '#'+modal.id;
$(modalselector).css("z-index", "2060");

var modal2 = new Modal({
    title : "Prompt",
    id: 'modal-detail',
    backdrop : true,
    handler : {
        OK : {class : "btn-success"},
        Cancel : {class : "btn-default", dismiss : true}
    }
});
var modalselector2 = '#'+modal2.id;
$(modalselector2).css("z-index", "2070");
$(modalselector2 + ' .modal-dialog').css("width", "80%");
                        
var modal3 = new Modal({
    title : "Prompt",
    id: 'modal-progress',
    backdrop : true,
    handler : {
        OK : {class : "btn-success"},
        Cancel : {class : "btn-default", dismiss : true}
    }
});
var modalselector3 = '#'+modal3.id;
$(modalselector3).css("z-index", "2080");

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
        
        newMarker.reportid = latLongArray[i]._id;
        google.maps.event.addListener(newMarker, 'click', function(mark) {
            var reportid = this.reportid;
            
            //asdf
            var bodyel = '<div class="row">\n<div class="col-md-5">\n<h3 class="report-title">loading title..</h3>\n<div class="avatar-name"><i class="fa fa-user" aria-hidden="true"></i>&nbsp;<span class="report-author"></span></div>\n<small class="report-date"></small>\n<div>&nbsp;</div>\n</div>\n</div>\n<div class="row">\n<div class="col-md-5">\n<div class="carousel slide hidden" id="carousel-detail-modal" style="width:400px">\n<div class="carousel-inner">\n<div class="item active">\n<img alt="image" style="height:300px;width:auto;display:block;margin-left:auto;margin-right:auto;margin-bottom:0!important" class="img-responsive" src="/img/post/no-media.jpg">\n</div>\n</div>\n<a data-slide="prev" href="#carousel-detail-modal" class="left carousel-control">\n<span class="icon-prev"></span>\n</a>\n<a data-slide="next" href="#carousel-detail-modal" class="right carousel-control">\n<span class="icon-next"></span>\n</a>\n</div>\n</div>\n<div class="col-md-7 right-content">\n<p class="report-content" style="font-family:\'/open sans\'/,\'/Helvetica Neue\'/,Helvetica,Arial,sans-serif;font-size:15px;line-height:26px">\nloading report content..</p>\n<div class="well hidden">\nlatest progress : <strong>Survey on location</strong>&nbsp;\n<a class="btn btn-success btn-facebook btn-outline pr-timeline-btn">\n<i class="fa fa-zoom"> </i> view progress timeline\n</a>\n</div>\n</div>\n</div>';
            modal2.setTitle('Report Detail');
            modal2.setBody(bodyel).show();
            modal2.$buttons.OK.off("click");
            modal2.$buttons.OK.on("click", function () {  
                modal2.hide();
            });
            
            $.ajax({
                url:'/admin/!/reportdetail?postid='+reportid,
                success: function(detaildata, status, xhr){
                    console.log(detaildata);
                    if(detaildata.status !==0){
                        $('#carousel-detail-modal').removeClass('hidden');
                        var detailreport = detaildata.data;
                        var steps = detaildata.steps;
                        var reportTitle = 'Untitled Report';
                        var reportAuthor = detailreport.users._id.name.first;
                        if(detailreport.users._id.name.hasOwnProperty('last') && detailreport.users._id.name.last != null){
                            reportAuthor = detailreport.users._id.name.first + ' ' + detailreport.users._id.name.last;
                        }
                        if(detailreport.hasOwnProperty('title')){
                            reportTitle = detailreport.title;
                        }
        
                        $(modalselector2 + ' .report-title').html(reportTitle);
                        $(modalselector2 + ' .report-author').html(reportAuthor);
                        $(modalselector2 + ' .report-date').html(detailreport.createdAt.substr(0, detailreport.createdAt.indexOf('T')) + " " + detailreport.createdAt.substr(detailreport.createdAt.indexOf('T')+1, 8));
                        $(modalselector2 + ' .report-content').html(detailreport.text);
                        if(detailreport.hasOwnProperty('media')){
                            if(detailreport.media._ids.length > 0){
                                $(modalselector2 + ' #carousel-detail-modal .carousel-inner').html('');
                                var medias = '';
                                for(i=0; i<detailreport.media._ids.length; i++){
                                    var activeToggle = '';
                                    if (i == 0) {
                                        activeToggle = ' active';
                                    }
                                    
                                    if (detailreport.media._ids[i].type === "video/mp4") {
                                        medias += '<div class="item'+activeToggle+'">' +
                                            '<video style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; padding-left: 100px; padding-right: 100px;" controls>' +
                                            '<source src="/img/post/' + detailreport.media._ids[i].directory + '" type="video/mp4">' +
                                            'Your browser does not support HTML5 video.' +
                                            '</video>' +
                                            '</div>';
                                    } else {
                                        medias += '<div class="item'+activeToggle+' img-preview">' +
                                            '<a href="/img/post/' + detailreport.media._ids[i].directory + '" title="">'+
                                                '<img alt="image" style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; margin-bottom: 0px !important;" class="img-responsive" src="/img/post/' + detailreport.media._ids[i].directory + '">' +
                                            '</a>'+
                                            
                                            '</div>';
                                            
                                    }
                                }
                                $(modalselector2 + ' #carousel-detail-modal .carousel-inner').html(medias);
                            }
                        }
                        
                        if((detailreport.hasOwnProperty('finished')) && (detailreport.finished === true)){
                            $('.right-content .well>strong').html('finished');
                        } else {
                            if(detailreport.hasOwnProperty('rejected')){
                                $('.right-content .well>strong').html('rejected');   
                                $('.right-content .well>a').addClass('hidden');
                            } else {
                                if(detailreport.statuses.length>0){
                                    $('.right-content .well>strong').html(detailreport.statuses[detailreport.statuses.length-1].steps._id.name);    
                                } else {
                                    $('.right-content .well>strong').html('assigned to admin');   
                                    $('.right-content .well>a').addClass('hidden');
                                }
                            }
                        }
                        
                        $('.right-content .well').removeClass('hidden');
                        $(modalselector2 + ' .pr-timeline-btn').off('click');
                        $(modalselector2 + ' .pr-timeline-btn').on('click', function(e){
                            var bodyel2 = '<div class="row">'+
                                            '<h2>SOP : '+steps[0].procedures._id.name+'</h2>'+
                                            '<div class="timeline timeline-line-dotted">';
                            for(i=0; i<steps.length; i++){
                                if (detailreport.statuses[i] !== undefined) {
                                    var imagepanel = '';
                                    var remarktext = '';
                                    
                                    if(detailreport.statuses[i].hasOwnProperty("media")){
                                        imagepanel = '<div class="panel img-preview">'+
                                                '<a href="/img/post/' + detailreport.statuses[i].media._id.directory + '" title="">'+
                                                    '<img src="/img/post/' + detailreport.statuses[i].media._id.directory + '" alt="">'+
                                                '</a>'+
                                            '</div>';
                                    }
                                    if(detailreport.statuses[i].hasOwnProperty("remark")){
                                        remarktext = '<div class="well well-sm">'+
                                        '<h3>Remark :</h3>'+
                                        detailreport.statuses[i].remark +
                                    '</div>';
                                    }
                                    
                                    if (i == detailreport.statuses.length - 1) {
                                        if(detailreport.finished){
                                            var dateori = new Date(detailreport.statuses[i].createdAt);
                                            var dateori2 = new Date(detailreport.statuses[i].finishedAt); 
                                            var dateString = (dateori.getDate() < 9 ? "0" + dateori.getDate() : dateori.getDate()) + '-' + ((dateori.getMonth() + 1) < 9 ? "0" + (dateori.getMonth() + 1) : (dateori.getMonth() + 1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours() < 9 ? "0" + dateori.getHours() : dateori.getHours()) + ':' + (dateori.getMinutes() < 9 ? "0" + dateori.getMinutes() : dateori.getMinutes()) + ':' + (dateori.getSeconds() < 9 ? "0" + dateori.getSeconds() : dateori.getSeconds());
                                            var dateString2 = (dateori2.getDate() < 9 ? "0" + dateori2.getDate() : dateori2.getDate()) + '-' + ((dateori2.getMonth() + 1) < 9 ? "0" + (dateori2.getMonth() + 1) : (dateori2.getMonth() + 1)) + '-' + dateori2.getFullYear() + ' ' + (dateori2.getHours() < 9 ? "0" + dateori2.getHours() : dateori2.getHours()) + ':' + (dateori2.getMinutes() < 9 ? "0" + dateori2.getMinutes() : dateori2.getMinutes()) + ':' + (dateori2.getSeconds() < 9 ? "0" + dateori2.getSeconds() : dateori2.getSeconds());
        
                                            bodyel2 += '<span class="timeline-label">' +
                                                '<span class="label label-primary">' + dateString + '</span>' +
                                                '</span>' +
                                                '<div class="timeline-item">' +
                                                '<div class="timeline-point timeline-point-success">' +
                                                '<i class="fa fa-check"></i>' +
                                                '</div>' +
                                                '<div class="timeline-event">' +
                                                '<div class="timeline-heading">' +
                                                '<h4>' + steps[i].name + '</h4>' +
                                                '</div>' +
                                                '<div class="timeline-body">' +
                                                '<p>' + steps[i].description + '</p>' +
                                                imagepanel +
                                                '<p>&nbsp;</p>'+
                                                remarktext +
                                                '</div>' +
                                                
                                                '<div class="timeline-footer">' +
                                                '<p class="text-right">finished on ' + dateString2 + '</p>' +
                                                '</div>' +
                                                '</div>' +
                                                '</div>';
                                        } else {
                                            var dateori = new Date(detailreport.statuses[i].createdAt);
                                            var dateString = (dateori.getDate() < 9 ? "0" + dateori.getDate() : dateori.getDate()) + '-' + ((dateori.getMonth() + 1) < 9 ? "0" + (dateori.getMonth() + 1) : (dateori.getMonth() + 1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours() < 9 ? "0" + dateori.getHours() : dateori.getHours()) + ':' + (dateori.getMinutes() < 9 ? "0" + dateori.getMinutes() : dateori.getMinutes()) + ':' + (dateori.getSeconds() < 9 ? "0" + dateori.getSeconds() : dateori.getSeconds());
        
                                            bodyel2 += '<span class="timeline-label">' +
                                                '<span class="label label-primary">' + dateString + '</span>' +
                                                '</span>' +
                                                '<div class="timeline-item">' +
                                                '<div class="timeline-point timeline-point-warning">' +
                                                '<i class="fa fa-clock-o"></i>' +
                                                '</div>' +
                                                '<div class="timeline-event">' +
                                                '<div class="timeline-heading">' +
                                                '<h4>' + steps[i].name + '</h4>' +
                                                '</div>' +
                                                '<div class="timeline-body">' +
                                                '<p>' + steps[i].description + '</p>' +
                                                '</div>' +
                                                '<div class="timeline-footer">' +
                                                '<p class="text-right">estimate: ' + steps[i].duration + ' hour(s)</p>' +
                                                '</div>' +
                                                '</div>' +
                                                '</div>';
                                        }
                                        
                                    } else {
                                        var dateori = new Date(detailreport.statuses[i].createdAt);
                                        var dateori2 = new Date(detailreport.statuses[i].finishedAt); 
                                        var dateString = (dateori.getDate() < 9 ? "0" + dateori.getDate() : dateori.getDate()) + '-' + ((dateori.getMonth() + 1) < 9 ? "0" + (dateori.getMonth() + 1) : (dateori.getMonth() + 1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours() < 9 ? "0" + dateori.getHours() : dateori.getHours()) + ':' + (dateori.getMinutes() < 9 ? "0" + dateori.getMinutes() : dateori.getMinutes()) + ':' + (dateori.getSeconds() < 9 ? "0" + dateori.getSeconds() : dateori.getSeconds());
                                        var dateString2 = (dateori2.getDate() < 9 ? "0" + dateori2.getDate() : dateori2.getDate()) + '-' + ((dateori2.getMonth() + 1) < 9 ? "0" + (dateori2.getMonth() + 1) : (dateori2.getMonth() + 1)) + '-' + dateori2.getFullYear() + ' ' + (dateori2.getHours() < 9 ? "0" + dateori2.getHours() : dateori2.getHours()) + ':' + (dateori2.getMinutes() < 9 ? "0" + dateori2.getMinutes() : dateori2.getMinutes()) + ':' + (dateori2.getSeconds() < 9 ? "0" + dateori2.getSeconds() : dateori2.getSeconds());
        
                                        bodyel2 += '<span class="timeline-label">' +
                                            '<span class="label label-primary">' + dateString + '</span>' +
                                            '</span>' +
                                            '<div class="timeline-item">' +
                                            '<div class="timeline-point timeline-point-success">' +
                                            '<i class="fa fa-check"></i>' +
                                            '</div>' +
                                            '<div class="timeline-event">' +
                                            '<div class="timeline-heading">' +
                                            '<h4>' + steps[i].name + '</h4>' +
                                            '</div>' +
                                            '<div class="timeline-body">' +
                                            '<p>' + steps[i].description + '</p>' +
                                            imagepanel +
                                            '<p>&nbsp;</p>'+
                                            remarktext +
                                            '</div>' +
                                            '<div class="timeline-footer">' +
                                            '<p class="text-right">finished on ' + dateString2 + '</p>' +
                                            '</div>' +
                                            '</div>' +
                                            '</div>';
                                    }
                                } else {
                                    bodyel2 += '<div class="timeline-item">' +
                                        '<div class="timeline-point timeline-point-danger">' +
                                        '<i class="fa fa-times"></i>' +
                                        '</div>' +
                                        '<div class="timeline-event">' +
                                        '<div class="timeline-heading">' +
                                        '<h4>' + steps[i].name + '</h4>' +
                                        '</div>' +
                                        '<div class="timeline-body">' +
                                        '<p>' + steps[i].description + '</p>' +
                                        '</div>' +
                                        '<div class="timeline-footer">' +
                                        '<p class="text-right">estimate: ' + steps[i].duration + ' hour(s)</p>' +
                                        '</div>' +
                                        '</div>' +
                                        '</div>';
                                }
                            }    
                            
                            bodyel2 += '<span class="timeline-label">'+
                                                    '<a class="btn btn-default" title="END">'+
                                                        '<i class="fa fa-fw fa-certificate"></i>'+
                                                    '</a>'+
                                                '</span>'+
                                            '</div>'+
                                        '</div>';
                            
                            modal3.setTitle('Progress Timeline');
                            modal3.setBody(bodyel2).show();
                            modal3.$buttons.OK.off("click");
                            modal3.$buttons.OK.on("click", function () {    
                                modal3.hide();
                            });
                        });
                    } else {
                        //TODO
                        console.log(detaildata);
                    }
                    
                },
                error: function(xhr, status, err){
                    //TODO
                    console.log(err);
                }
            });
        });
        markers.push(newMarker);
    }
}

function initMonthlyBarChart(_data, offset){
    var tickData = [[0, "Jan"], [1, "Feb"], [2, "Mar"], [3, "Apr"], [4, "May"], [5, "Jun"], [6, "Jul"], [7, "Aug"], [8, "Sep"], [9, "Oct"], [10, "Nov"], [11, "Des"]];
    var offsetTickData = [];
    for(var i = 0; i<12; i++){
        if(i+offset > 11){
            offsetTickData.push([i, tickData[i+offset-12][1]]);    
        } else {
            offsetTickData.push([i, tickData[i+offset][1]]);
        }
    }
    
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
            ticks: offsetTickData
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

    setBarChartClickEvent(offset);
}

function loadDashboardData(){
    // get all dashboard data
    $.ajax({
        method: 'GET',
        url: '/admin/!/alldashboarddata',
        success: function(data, status, xhr){
            if(data.status===1){
                dashboardData = data.data;
                $('#totalcount').html(dashboardData.allreportltlng.length);
                $('#returnedcount').html(dashboardData.returnedreportltlng.length);
                $('#finishedcount').html(dashboardData.finishedreportltlng.length);
                $('#incomingcount').html(dashboardData.incomingreportltlng.length);
                $('#assignedcount').html(dashboardData.assignedreportltlng.length);
                orglat = dashboardData.orglocationlat;
                orglong = dashboardData.orglocationlong;
                
                // do the map
                initMap();

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
                        case 'Returned Reports':
                            reloadMarkers(dashboardData.returnedreportltlng);
                            break;
                        case 'Finished Reports':
                            reloadMarkers(dashboardData.finishedreportltlng);
                            break;
                    }
                    console.log("changed");
                });

                //init bar chart for monthly reports
                var barchartdata = [];
                for(i=0; i<12; i++){
                    barchartdata.push([i, dashboardData.monthlyreports[i].sum]);
                }
                initMonthlyBarChart(barchartdata, dashboardData.monthlyreportoffset);

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
        var datatype = $(this).children().last().children().last().attr('datatype');
        modal.setTitle('Detail ' + title);
        modal.setBody('<div id="pie-detail">Loading chart..</div>').show();
    
        $.ajax({
            url:'/admin/!/reportcountbycategory?type='+datatype,
            success: function(data, status, xhr){
                console.log(data);
                var aggData = data.data;
                var colData = [];
                var col = [];
                for(i=0; i<aggData.length; i++){
                    if(aggData[i]._id === null){
                        col = ["unassigned", aggData[i].sum];
                    } else {
                        col = [aggData[i].category[0].name, aggData[i].sum];
                    }
                    colData.push(col);
                }
                // pie chat init
                c3.generate({
                    bindto: '#pie-detail',
                    data:{
                        columns: colData,
                        colors:{
                            //data1: '#1ab394',
                            //data2: '#BABABA'
                        },
                        type : 'pie',
                        onclick: function (d, i) { 
                            console.log(d);
                        },
                    },
                    pie: {
                        label: {
                            format: function(value, ratio, id) {
                                return value;
                          }
                        }
                    }
                });
            },
            error: function(xhr, status, err){
                //TODO
                console.log(err);
            }
        });

        modal.$buttons.OK.off("click");
        modal.$buttons.OK.on("click", function () {
           
        });
    });
}

function setBarChartClickEvent(_offset){
    $("#flot-bar-chart").bind("plotclick", function (event, pos, item) {
        console.log(item);
        var idx = item.dataIndex+_offset;
        var yr = new Date().getFullYear()-1;
        if(idx > 11){
            idx = idx-12;
            yr = yr+1;
        }
        modal.setTitle("Monthly Report Detail");

        if (item.datapoint[1] === 0) {
            modal2.setBody('<div>No report found in ' + monthNameList[idx] + ' ' + yr.toString() + '.</div>').show();
            modal2.$buttons.OK.off("click");
            modal2.$buttons.OK.on("click", function () {
            });
        } else {
            var modalBody = '<h2>List all reports in ' + monthNameList[idx] + ' ' + yr.toString() + '</h2>' +
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
                url:'/admin/!/monthlyreports?m=' + idx,
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
                            var rowdata = $('#monthly-list-report').dataTable().fnGetData(this);
                            console.log(rowdata);
                            //asdf
                            var bodyel = '<div class="row">\n<div class="col-md-5">\n<h3 class="report-title">loading title..</h3>\n<div class="avatar-name"><i class="fa fa-user" aria-hidden="true"></i>&nbsp;<span class="report-author"></span></div>\n<small class="report-date"></small>\n<div>&nbsp;</div>\n</div>\n</div>\n<div class="row">\n<div class="col-md-5">\n<div class="carousel slide hidden" id="carousel-detail-modal" style="width:400px">\n<div class="carousel-inner">\n<div class="item active">\n<img alt="image" style="height:300px;width:auto;display:block;margin-left:auto;margin-right:auto;margin-bottom:0!important" class="img-responsive" src="/img/post/no-media.jpg">\n</div>\n</div>\n<a data-slide="prev" href="#carousel-detail-modal" class="left carousel-control">\n<span class="icon-prev"></span>\n</a>\n<a data-slide="next" href="#carousel-detail-modal" class="right carousel-control">\n<span class="icon-next"></span>\n</a>\n</div>\n</div>\n<div class="col-md-7 right-content">\n<p class="report-content" style="font-family:\'/open sans\'/,\'/Helvetica Neue\'/,Helvetica,Arial,sans-serif;font-size:15px;line-height:26px">\nloading report content..</p>\n<div class="well hidden">\nlatest progress : <strong>Survey on location</strong>&nbsp;\n<a class="btn btn-success btn-facebook btn-outline pr-timeline-btn">\n<i class="fa fa-zoom"> </i> view progress timeline\n</a>\n</div>\n</div>\n</div>';
                            modal2.setTitle('Report Detail');
                            modal2.setBody(bodyel).show();
                            modal2.$buttons.OK.off("click");
                            modal2.$buttons.OK.on("click", function () {  
                                modal2.hide();
                            });
                            
                            $.ajax({
                                url:'/admin/!/reportdetail?postid='+rowdata[0],
                                success: function(detaildata, status, xhr){
                                    console.log(detaildata);
                                    if(detaildata.status !==0){
                                        $('#carousel-detail-modal').removeClass('hidden');
                                        var detailreport = detaildata.data;
                                        var steps = detaildata.steps;
                                        var reportTitle = 'Untitled Report';
                                        var reportAuthor = detailreport.users._id.name.first;
                                        if(detailreport.users._id.name.hasOwnProperty('last') && detailreport.users._id.name.last != null){
                                            reportAuthor = detailreport.users._id.name.first + ' ' + detailreport.users._id.name.last;
                                        }
                                        if(detailreport.hasOwnProperty('title')){
                                            reportTitle = detailreport.title;
                                        }
                        
                                        $(modalselector2 + ' .report-title').html(reportTitle);
                                        $(modalselector2 + ' .report-author').html(reportAuthor);
                                        $(modalselector2 + ' .report-date').html(detailreport.createdAt.substr(0, detailreport.createdAt.indexOf('T')) + " " + detailreport.createdAt.substr(detailreport.createdAt.indexOf('T')+1, 8));
                                        $(modalselector2 + ' .report-content').html(detailreport.text);
                                        if(detailreport.hasOwnProperty('media')){
                                            if(detailreport.media._ids.length > 0){
                                                $(modalselector2 + ' #carousel-detail-modal .carousel-inner').html('');
                                                var medias = '';
                                                for(i=0; i<detailreport.media._ids.length; i++){
                                                    var activeToggle = '';
                                                    if (i == 0) {
                                                        activeToggle = ' active';
                                                    }
                                                    
                                                    if (detailreport.media._ids[i].type === "video/mp4") {
                                                        medias += '<div class="item'+activeToggle+'">' +
                                                            '<video style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; padding-left: 100px; padding-right: 100px;" controls>' +
                                                            '<source src="/img/post/' + detailreport.media._ids[i].directory + '" type="video/mp4">' +
                                                            'Your browser does not support HTML5 video.' +
                                                            '</video>' +
                                                            '</div>';
                                                    } else {
                                                        medias += '<div class="item'+activeToggle+' img-preview">' +
                                                            '<a href="/img/post/' + detailreport.media._ids[i].directory + '" title="">'+
                                                                '<img alt="image" style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; margin-bottom: 0px !important;" class="img-responsive" src="/img/post/' + detailreport.media._ids[i].directory + '">' +
                                                            '</a>'+
                                                            
                                                            '</div>';
                                                            
                                                    }
                                                }
                                                $(modalselector2 + ' #carousel-detail-modal .carousel-inner').html(medias);
                                            }
                                        }
                                        
                                        if((detailreport.hasOwnProperty('finished')) && (detailreport.finished === true)){
                                            $('.right-content .well>strong').html('finished');
                                        } else {
                                            if(detailreport.hasOwnProperty('rejected')){
                                                $('.right-content .well>strong').html('rejected');   
                                                $('.right-content .well>a').addClass('hidden');
                                            } else {
                                                if(detailreport.statuses.length>0){
                                                    $('.right-content .well>strong').html(detailreport.statuses[detailreport.statuses.length-1].steps._id.name);    
                                                } else {
                                                    $('.right-content .well>strong').html('assigned to admin');   
                                                    $('.right-content .well>a').addClass('hidden');
                                                }
                                            }
                                        }
                                        
                                        $('.right-content .well').removeClass('hidden');
                                        $(modalselector2 + ' .pr-timeline-btn').off('click');
                                        $(modalselector2 + ' .pr-timeline-btn').on('click', function(e){
                                            var bodyel2 = '<div class="row">'+
                                                            '<h2>SOP : '+steps[0].procedures._id.name+'</h2>'+
                                                            '<div class="timeline timeline-line-dotted">';
                                            for(i=0; i<steps.length; i++){
                                                if (detailreport.statuses[i] !== undefined) {
                                                    var imagepanel = '';
                                                    var remarktext = '';
                                                    
                                                    if(detailreport.statuses[i].hasOwnProperty("media")){
                                                        imagepanel = '<div class="panel img-preview">'+
                                                                '<a href="/img/post/' + detailreport.statuses[i].media._id.directory + '" title="">'+
                                                                    '<img src="/img/post/' + detailreport.statuses[i].media._id.directory + '" alt="">'+
                                                                '</a>'+
                                                            '</div>';
                                                    }
                                                    if(detailreport.statuses[i].hasOwnProperty("remark")){
                                                        remarktext = '<div class="well well-sm">'+
                                                        '<h3>Remark :</h3>'+
                                                        detailreport.statuses[i].remark +
                                                    '</div>';
                                                    }
                                                    
                                                    if (i == detailreport.statuses.length - 1) {
                                                        if(detailreport.finished){
                                                            var dateori = new Date(detailreport.statuses[i].createdAt);
                                                            var dateori2 = new Date(detailreport.statuses[i].finishedAt); 
                                                            var dateString = (dateori.getDate() < 9 ? "0" + dateori.getDate() : dateori.getDate()) + '-' + ((dateori.getMonth() + 1) < 9 ? "0" + (dateori.getMonth() + 1) : (dateori.getMonth() + 1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours() < 9 ? "0" + dateori.getHours() : dateori.getHours()) + ':' + (dateori.getMinutes() < 9 ? "0" + dateori.getMinutes() : dateori.getMinutes()) + ':' + (dateori.getSeconds() < 9 ? "0" + dateori.getSeconds() : dateori.getSeconds());
                                                            var dateString2 = (dateori2.getDate() < 9 ? "0" + dateori2.getDate() : dateori2.getDate()) + '-' + ((dateori2.getMonth() + 1) < 9 ? "0" + (dateori2.getMonth() + 1) : (dateori2.getMonth() + 1)) + '-' + dateori2.getFullYear() + ' ' + (dateori2.getHours() < 9 ? "0" + dateori2.getHours() : dateori2.getHours()) + ':' + (dateori2.getMinutes() < 9 ? "0" + dateori2.getMinutes() : dateori2.getMinutes()) + ':' + (dateori2.getSeconds() < 9 ? "0" + dateori2.getSeconds() : dateori2.getSeconds());
                        
                                                            bodyel2 += '<span class="timeline-label">' +
                                                                '<span class="label label-primary">' + dateString + '</span>' +
                                                                '</span>' +
                                                                '<div class="timeline-item">' +
                                                                '<div class="timeline-point timeline-point-success">' +
                                                                '<i class="fa fa-check"></i>' +
                                                                '</div>' +
                                                                '<div class="timeline-event">' +
                                                                '<div class="timeline-heading">' +
                                                                '<h4>' + steps[i].name + '</h4>' +
                                                                '</div>' +
                                                                '<div class="timeline-body">' +
                                                                '<p>' + steps[i].description + '</p>' +
                                                                imagepanel +
                                                                '<p>&nbsp;</p>'+
                                                                remarktext +
                                                                '</div>' +
                                                                
                                                                '<div class="timeline-footer">' +
                                                                '<p class="text-right">finished on ' + dateString2 + '</p>' +
                                                                '</div>' +
                                                                '</div>' +
                                                                '</div>';
                                                        } else {
                                                            var dateori = new Date(detailreport.statuses[i].createdAt);
                                                            var dateString = (dateori.getDate() < 9 ? "0" + dateori.getDate() : dateori.getDate()) + '-' + ((dateori.getMonth() + 1) < 9 ? "0" + (dateori.getMonth() + 1) : (dateori.getMonth() + 1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours() < 9 ? "0" + dateori.getHours() : dateori.getHours()) + ':' + (dateori.getMinutes() < 9 ? "0" + dateori.getMinutes() : dateori.getMinutes()) + ':' + (dateori.getSeconds() < 9 ? "0" + dateori.getSeconds() : dateori.getSeconds());
                        
                                                            bodyel2 += '<span class="timeline-label">' +
                                                                '<span class="label label-primary">' + dateString + '</span>' +
                                                                '</span>' +
                                                                '<div class="timeline-item">' +
                                                                '<div class="timeline-point timeline-point-warning">' +
                                                                '<i class="fa fa-clock-o"></i>' +
                                                                '</div>' +
                                                                '<div class="timeline-event">' +
                                                                '<div class="timeline-heading">' +
                                                                '<h4>' + steps[i].name + '</h4>' +
                                                                '</div>' +
                                                                '<div class="timeline-body">' +
                                                                '<p>' + steps[i].description + '</p>' +
                                                                '</div>' +
                                                                '<div class="timeline-footer">' +
                                                                '<p class="text-right">estimate: ' + steps[i].duration + ' hour(s)</p>' +
                                                                '</div>' +
                                                                '</div>' +
                                                                '</div>';
                                                        }
                                                        
                                                    } else {
                                                        var dateori = new Date(detailreport.statuses[i].createdAt);
                                                        var dateori2 = new Date(detailreport.statuses[i].finishedAt); 
                                                        var dateString = (dateori.getDate() < 9 ? "0" + dateori.getDate() : dateori.getDate()) + '-' + ((dateori.getMonth() + 1) < 9 ? "0" + (dateori.getMonth() + 1) : (dateori.getMonth() + 1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours() < 9 ? "0" + dateori.getHours() : dateori.getHours()) + ':' + (dateori.getMinutes() < 9 ? "0" + dateori.getMinutes() : dateori.getMinutes()) + ':' + (dateori.getSeconds() < 9 ? "0" + dateori.getSeconds() : dateori.getSeconds());
                                                        var dateString2 = (dateori2.getDate() < 9 ? "0" + dateori2.getDate() : dateori2.getDate()) + '-' + ((dateori2.getMonth() + 1) < 9 ? "0" + (dateori2.getMonth() + 1) : (dateori2.getMonth() + 1)) + '-' + dateori2.getFullYear() + ' ' + (dateori2.getHours() < 9 ? "0" + dateori2.getHours() : dateori2.getHours()) + ':' + (dateori2.getMinutes() < 9 ? "0" + dateori2.getMinutes() : dateori2.getMinutes()) + ':' + (dateori2.getSeconds() < 9 ? "0" + dateori2.getSeconds() : dateori2.getSeconds());
                        
                                                        bodyel2 += '<span class="timeline-label">' +
                                                            '<span class="label label-primary">' + dateString + '</span>' +
                                                            '</span>' +
                                                            '<div class="timeline-item">' +
                                                            '<div class="timeline-point timeline-point-success">' +
                                                            '<i class="fa fa-check"></i>' +
                                                            '</div>' +
                                                            '<div class="timeline-event">' +
                                                            '<div class="timeline-heading">' +
                                                            '<h4>' + steps[i].name + '</h4>' +
                                                            '</div>' +
                                                            '<div class="timeline-body">' +
                                                            '<p>' + steps[i].description + '</p>' +
                                                            imagepanel +
                                                            '<p>&nbsp;</p>'+
                                                            remarktext +
                                                            '</div>' +
                                                            '<div class="timeline-footer">' +
                                                            '<p class="text-right">finished on ' + dateString2 + '</p>' +
                                                            '</div>' +
                                                            '</div>' +
                                                            '</div>';
                                                    }
                                                } else {
                                                    bodyel2 += '<div class="timeline-item">' +
                                                        '<div class="timeline-point timeline-point-danger">' +
                                                        '<i class="fa fa-times"></i>' +
                                                        '</div>' +
                                                        '<div class="timeline-event">' +
                                                        '<div class="timeline-heading">' +
                                                        '<h4>' + steps[i].name + '</h4>' +
                                                        '</div>' +
                                                        '<div class="timeline-body">' +
                                                        '<p>' + steps[i].description + '</p>' +
                                                        '</div>' +
                                                        '<div class="timeline-footer">' +
                                                        '<p class="text-right">estimate: ' + steps[i].duration + ' hour(s)</p>' +
                                                        '</div>' +
                                                        '</div>' +
                                                        '</div>';
                                                }
                                            }    
                                            
                                            bodyel2 += '<span class="timeline-label">'+
                                                                    '<a class="btn btn-default" title="END">'+
                                                                        '<i class="fa fa-fw fa-certificate"></i>'+
                                                                    '</a>'+
                                                                '</span>'+
                                                            '</div>'+
                                                        '</div>';
                                            
                                            modal3.setTitle('Progress Timeline');
                                            modal3.setBody(bodyel2).show();
                                            modal3.$buttons.OK.off("click");
                                            modal3.$buttons.OK.on("click", function () {    
                                                modal3.hide();
                                            });
                                        });
                                    } else {
                                        //TODO
                                        console.log(detaildata);
                                    }
                                    
                                },
                                error: function(xhr, status, err){
                                    //TODO
                                    console.log(err);
                                }
                            });

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
    var orgLocation = {lat: orglat, lng: orglong};
    map = new google.maps.Map($('#dashboard-maps')[0], {
        zoom: 12,
        center: orgLocation
    });
}

$(document).ready(function(){

    loadDashboardData();

    setDetailButtonEvent();
    
    $('body').on('click', '.img-preview', function(event){
        event = event || window.event;
        var target = event.target || event.srcElement,
            link = target.src ? target.parentNode : target,
            options = {index: link, event: event},
            links = this.getElementsByTagName('a');
        blueimp.Gallery(links, options);
    })
});