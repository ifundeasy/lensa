// modal detail 
var modal = new Modal({
    title : "Prompt",
    id: 'modal-assign',
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

var reportdata = {};
var nextreportid = '';

function setAssign(postId, userId, sopId){
    $.ajax({
        method: 'POST',
        url: '/admin/!/assignsop',
        data: {
            postid: postId,
            userid: userId,
            sopid: sopId
        },
        success: function(data, status, xhr){
            if(data.status!==1){
                alert("Failed to assign report!");
            } else {
                modal.$buttons.OK.html('Assigned. Reloading..');
                location.reload();
            }
        },
        error: function(xhr, status, err){
            // TODO
        }
    });
}

function getsop(_id){
    $.ajax({
        method: 'GET',
        url: '/admin/!/sop?postid=' + _id,
        success: function(data, status, xhr){
            $('#btn-disposisi').removeClass('disabled');
            var sopData = data.sopdata;
            var implementordata = data.implementordata;
            console.log(data);
            // modal creation
            modal.setTitle('Assign Report to SOP');

            var sopOptions = '<option value="0"> -- Select SOP -- </option>';
            var implementorOptions = '<option value="0"> -- Select Implementor -- </option>';
            
            for(x=0; x<sopData.length; x++){
                sopOptions += '<option value="'+sopData[x]._id+'">'+sopData[x].name+'</option>';
            }
            for(x=0; x<implementordata.length; x++){
                implementorOptions += '<option value="'+implementordata[x]._id+'">'+implementordata[x].name.first+' '+implementordata[x].name.last+'</option>';
            }

            var modalBody = '<h2>Select SOP</h2>'+
                            '<select id="sop-select">' +
                                sopOptions +
                            '</select>'+
                            
                            '<h2>Select Implementor</h2>'+
                            '<select id="implementor-select">' +
                                implementorOptions +
                            '</select>';
            modal.setBody(modalBody).show();

            modal.$buttons.OK.off("click");
            modal.$buttons.OK.on("click", function () {
                if($('#implementor-select').val() == '0' || $('#implementor-select').val() == null){
                    alert("Invalid Implementor ID");
                } else {
                    if($('#sop-select').val() == '0' || $('#sop-select').val() == null){
                        alert("Invalid SOP ID");
                    } else {
                        modal.$buttons.OK.html('assigning..');
                        modal.$buttons.OK.addClass('disabled');
                        setAssign(nextreportid, $('#implementor-select').val(), $('#sop-select').val());
                    }
                }
            });
        },
        error: function(xhr, status, err){
            // TODO
        }
    });
    
}

function getNextReport(){
    $.ajax({
        method: 'GET',
        url:'/admin/!/nextreport',
        success: function(data, status, xhr){
            if(data.data.length == 0){
                $('.ibox-content').eq(0).html('<h1>No incoming reports</h1>');
            } else {
                var nextreport = data.data[0];
                var reportTitle = 'Untitled Report';
                var reportAuthor = nextreport.users._id.name.first;
                if(nextreport.users._id.name.hasOwnProperty('last') && nextreport.users._id.name.last != null){
                    reportAuthor = nextreport.users._id.name.first + ' ' + nextreport.users._id.name.last;
                }
                if(nextreport.hasOwnProperty('title')){
                    reportTitle = nextreport.title;
                }

                $('#report-title').html(reportTitle);
                $('#report-author').html(reportAuthor);
                $('#report-date').html(nextreport.createdAt.substr(0, nextreport.createdAt.indexOf('T')) + " " + nextreport.createdAt.substr(nextreport.createdAt.indexOf('T')+1, 8));
                $('#report-content').html(nextreport.text);
                if(nextreport.hasOwnProperty('media')){
                    if(nextreport.media._ids.length > 0){
                        $('#carousel-laporan .carousel-inner').html('');
                        var medias = '';
                        for(i=0; i<nextreport.media._ids.length; i++){
                            if(i==0){
                                if(nextreport.media._ids[i].type === "video/mp4"){
                                    medias += '<div class="item active">'+
                                                '<video style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; padding-left: 100px; padding-right: 100px;" controls>'+
                                                  '<source src="/img/post/'+nextreport.media._ids[i].directory+'" type="video/mp4">'+
                                                  'Your browser does not support HTML5 video.'+
                                                '</video>'+
                                            '</div>';
                                } else {
                                    medias += '<div class="item active">'+
                                                '<img alt="image" style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; margin-bottom: 0px !important;" class="img-responsive" src="/img/post/'+nextreport.media._ids[i].directory+'">'+
                                            '</div>';  
                                }
                                
                            } else {
                                if(nextreport.media._ids[i].type === "video/mp4"){
                                    medias += '<div class="item">'+
                                                '<video style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; padding-left: 100px; padding-right: 100px;" controls>'+
                                                  '<source src="/img/post/'+nextreport.media._ids[i].directory+'" type="video/mp4">'+
                                                  'Your browser does not support HTML5 video.'+
                                                '</video>'+
                                            '</div>';
                                } else {
                                    medias += '<div class="item">'+
                                                '<img alt="image" style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; margin-bottom: 0px !important;" class="img-responsive" src="/img/post/'+nextreport.media._ids[i].directory+'">'+
                                            '</div>';
                                }
                                
                            }
                        }
                        $('#carousel-laporan .carousel-inner').html(medias);
                    }
                }

                $('#btn-disposisi').off('click');
                $('#btn-disposisi').removeAttr('disabled');
                $('#btn-return').off('click');
                $('#btn-return').removeAttr('disabled');

                nextreportid = nextreport._id;
                console.log("next report: ");
                console.log(nextreport);
                $('#btn-disposisi').on('click', function(){
                    $(this).addClass('disabled');
                    getsop(nextreportid);
                    
                });
                $('#btn-return').on('click', function(){
                    $(this).addClass('disabled');
                    setReturn(nextreportid);
                    
                });
            }
            $('.ibox-content').eq(0).css('display', 'block');
        },
        error: function(xhr, status, err){
            // TODO
        }
    });
}

function getAllreports(){
    $.ajax({
        method: 'GET',
        url: '/admin/!/allreports',
        success: function(data, status, xhr){
            if(data.status===1){
                reportdata = data.data;
                console.log("all reports :");
                console.log(reportdata);

                var tabelRows = '';
                for(i=0; i<reportdata.length; i++){
                    var reportTitle = 'Untitled Report';
                    if(reportdata[i].hasOwnProperty('title')){
                        reportTitle = reportdata[i].title;
                    }
                    tabelRows += '<tr>'+
                                        '<td>'+ reportdata[i]._id +'</td>'+
                                        '<td class="td-center">'+ reportTitle +'</td>'+
                                        '<td>'+ reportdata[i].text +'</td>'+
                                        '<td class="td-center">'+ reportdata[i].users._id.name.first +'</td>'+
                                        '<td class="td-center">' + reportdata[i].status + '</td>' +
                                        '<td class="td-center">'+ reportdata[i].createdAt.substr(0, reportdata[i].createdAt.indexOf('T')) + " " + reportdata[i].createdAt.substr(reportdata[i].createdAt.indexOf('T')+1, 8) +'</td>'+
                                        '<td class="td-center"><a class="btn btn-default btn-detail"><span class="glyphicon glyphicon-search"></span></a></td>'+
                                    '</tr>';

                    
                }
                $('#table-list-report tbody').html(tabelRows);

                $('#table-list-report').DataTable({
                    "columnDefs": [
                        {
                            "targets": 0,
                            "visible": false,
                            "searchable": false
                        },
                        { 
                            "targets": 1,
                            "width": "20%",
                        },
                        { 
                            "targets": 2,
                            "width": "30%"
                        },
                        { 
                            "targets": 3,
                            "width": "15%"
                        },
                        { 
                            "targets": 4,
                            "width": "10%"
                        },
                        { 
                            "targets": 5,
                            "width": "15%"
                        },
                        { 
                            "targets": 6,
                            "width": "10%"
                        }
                    ]
                } );

                $( "#table-list-report tbody" ).on( "click", ".btn-detail", function() {
                    //console.log( $( this ).text() );
                    var row = $(this).closest('tr');
                    var rowdata = $('#table-list-report').dataTable().fnGetData(row);
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
                                            if(i==0){
                                                if(detailreport.media._ids[i].type === "video/mp4"){
                                                    medias += '<div class="item active">'+
                                                                '<video style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; padding-left: 100px; padding-right: 100px;" controls>'+
                                                                  '<source src="/img/post/'+detailreport.media._ids[i].directory+'" type="video/mp4">'+
                                                                  'Your browser does not support HTML5 video.'+
                                                                '</video>'+
                                                            '</div>';
                                                } else {
                                                    medias += '<div class="item active">'+
                                                                '<img alt="image" style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; margin-bottom: 0px !important;" class="img-responsive" src="/img/post/'+detailreport.media._ids[i].directory+'">'+
                                                            '</div>';  
                                                }
                                                
                                            } else {
                                                if(detailreport.media._ids[i].type === "video/mp4"){
                                                    medias += '<div class="item">'+
                                                                '<video style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; padding-left: 100px; padding-right: 100px;" controls>'+
                                                                  '<source src="/img/post/'+detailreport.media._ids[i].directory+'" type="video/mp4">'+
                                                                  'Your browser does not support HTML5 video.'+
                                                                '</video>'+
                                                            '</div>';
                                                } else {
                                                    medias += '<div class="item">'+
                                                                '<img alt="image" style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; margin-bottom: 0px !important;" class="img-responsive" src="/img/post/'+detailreport.media._ids[i].directory+'">'+
                                                            '</div>';
                                                }
                                                
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
                                            if(detailreport.hasOwnProperty('returned')){
                                                $('.right-content .well>strong').html('returned to moderator');
                                            } else {
                                                $('.right-content .well>strong').html('assigned to admin');
                                            }
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
                                        if(detailreport.statuses[i] !== undefined){
                                            if (i == detailreport.statuses.length - 1) {
                                                if(detailreport.finished){
                                                    var dateori = new Date(detailreport.statuses[i].createdAt);
                                                    var dateString = (dateori.getDate() < 9 ? "0" + dateori.getDate() : dateori.getDate()) + '-' + ((dateori.getMonth() + 1) < 9 ? "0" + (dateori.getMonth() + 1) : (dateori.getMonth() + 1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours() < 9 ? "0" + dateori.getHours() : dateori.getHours()) + ':' + (dateori.getMinutes() < 9 ? "0" + dateori.getMinutes() : dateori.getMinutes()) + ':' + (dateori.getSeconds() < 9 ? "0" + dateori.getSeconds() : dateori.getSeconds());
    
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
                                                        '</div>' +
                                                        '<div class="timeline-footer">' +
                                                        '<p class="text-right">finished on ' + detailreport.statuses[i].finishedAt + '</p>' +
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
                                                var dateString = (dateori.getDate() < 9 ? "0" + dateori.getDate() : dateori.getDate()) + '-' + ((dateori.getMonth() + 1) < 9 ? "0" + (dateori.getMonth() + 1) : (dateori.getMonth() + 1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours() < 9 ? "0" + dateori.getHours() : dateori.getHours()) + ':' + (dateori.getMinutes() < 9 ? "0" + dateori.getMinutes() : dateori.getMinutes()) + ':' + (dateori.getSeconds() < 9 ? "0" + dateori.getSeconds() : dateori.getSeconds());

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
                                                    '</div>' +
                                                    '<div class="timeline-footer">' +
                                                    '<p class="text-right">finished on ' + detailreport.statuses[i].finishedAt + '</p>' +
                                                    '</div>' +
                                                    '</div>' +
                                                    '</div>';
                                            }
                                        } else {
                                            bodyel2 += '<div class="timeline-item">'+
                                                            '<div class="timeline-point timeline-point-danger">'+
                                                                '<i class="fa fa-times"></i>'+
                                                            '</div>'+
                                                            '<div class="timeline-event">'+
                                                                '<div class="timeline-heading">'+
                                                                    '<h4>'+steps[i].name+'</h4>'+
                                                                '</div>'+
                                                                '<div class="timeline-body">'+
                                                                    '<p>'+steps[i].description+'</p>'+
                                                                '</div>'+
                                                                '<div class="timeline-footer">'+
                                                                    '<p class="text-right">estimate: '+steps[i].duration+' hour(s)</p>'+
                                                                '</div>'+
                                                            '</div>'+
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
                var r = confirm("Failed to load report data. Reload page?");
                if (r == true) {
                    location.reload();   
                }
            }
            
        },
        error: function(xhr, status, err){
            // TODO
        }
    });
}

function setReturn(postId){
    
    // modal creation
    modal.setTitle('Return this report to moderator');

    var modalBody = '<h2 id="modal-reason-label">Reason :</h2>'+
                    '<textarea class="form-control" rows="3" id="return-reason"></textarea>';
    modal.setBody(modalBody).show();

    modal.$buttons.OK.off("click");
    modal.$buttons.OK.on("click", function () {
        if($('#return-reason').val().length > 10){
            if (confirm("Select this report to be returned to admin?") == true) {
                modal.$buttons.OK.html('submitting..');
                modal.$buttons.OK.addClass('disabled');
                $.ajax({
                    method: 'POST',
                    url: '/admin/!/markreturn',
                    data: {
                        postid: postId,
                        reason: $('#return-reason').val()
                    },
                    success: function(data, status, xhr){
                        if(data.status==1){
                            modal.$buttons.OK.html('submitted. Reloading..');
                            location.reload();
                        } else {
                            modal.$buttons.OK.html('OK');
                            modal.$buttons.OK.removeClass('disabled');
                            alert("Failed to mark report as return!");
                        }
                    },
                    error: function(xhr, status, err){
                        // TODO
                    }
                });
            }
        } else {
            $( '<div class="panel panel-danger"><div class="panel-heading">Reason should not less than 10 characters</div></div>' ).insertAfter( "#modal-reason-label" );
        }
        
    });
                
}

$(document).ready(function(){

    // get next report to be evaluated
    getNextReport();
    // get all report data
    getAllreports();
    
});