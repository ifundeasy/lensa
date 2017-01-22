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

var start = 0;
var limit = 10;

function loadTimeline(){
    $.ajax({
        url:'/admin/!/timeline?start=' + start + '&limit=' + limit,
        success: function(data, status, xhr){
            var reportData = data.data;
            console.log(reportData);
            for(q=0; q<reportData.length; q++){
                var timeline_el = '';
                var author = reportData[q].users._id.name.last===null? reportData[q].users._id.name.first : reportData[q].users._id.name.first + ' ' + reportData[q].users._id.name.last;
                var reportStatus = '';
                if(reportData[q].hasOwnProperty('assignTo')){ 
                    if(reportData[q].assignTo.hasOwnProperty('users')){
                    
                        if(reportData[q].hasOwnProperty('returned') && reportData[q].returned){
                            // returned
                            reportStatus = '<span class="badge badge-warning">Returned</span>';
                        } else {
                            reportStatus = '<span class="badge badge-success">On Progress</span>';
                        }
                    }
                    
                } else {
                    if(reportData[q].hasOwnProperty('rejected') && reportData[q].rejected){
                        // rejected
                        reportStatus = '<span class="badge badge-danger">Rejected</span>';
                    } else {
                        // pending
                        reportStatus = '<span class="badge badge-info">Pending</span>';
                    }
                }
                var title = '';
                if(reportData[q].hasOwnProperty('title') && reportData[q].title !== ''){
                    title = '<strong>' + reportData[q].title + '</strong>';
                } else {
                    title = '';
                }
                var medias = '';
                if(reportData[q].media._ids.length>0){
                    medias = '<div class="carousel slide" id="carousel-'+reportData[q]._id+'">'+
                                '<div class="carousel-inner">';
                    for(var lol=0; lol<reportData[q].media._ids.length; lol++){
                        if(lol==0){
                            if(reportData[q].media._ids[lol].type === "video/mp4"){
                                medias += '<div class="item active">'+
                                            '<video style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; padding-left: 100px; padding-right: 100px;" controls>'+
                                              '<source src="/img/post/'+reportData[q].media._ids[lol].directory+'" type="video/mp4">'+
                                              'Your browser does not support HTML5 video.'+
                                            '</video>'+
                                        '</div>';
                            } else {
                                medias += '<div class="item active">'+
                                            '<img alt="image" style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; margin-bottom: 0px !important;" class="img-responsive" src="/img/post/'+reportData[q].media._ids[lol].directory+'">'+
                                        '</div>';  
                            }
                            
                        } else {
                            if(reportData[q].media._ids[lol].type === "video/mp4"){
                                medias += '<div class="item">'+
                                            '<video style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; padding-left: 100px; padding-right: 100px;" controls>'+
                                              '<source src="/img/post/'+reportData[q].media._ids[lol].directory+'" type="video/mp4">'+
                                              'Your browser does not support HTML5 video.'+
                                            '</video>'+
                                        '</div>';
                            } else {
                                medias += '<div class="item">'+
                                            '<img alt="image" style="height: 300px; width: auto; display: block; margin-left: auto; margin-right: auto; margin-bottom: 0px !important;" class="img-responsive" src="/img/post/'+reportData[q].media._ids[lol].directory+'">'+
                                        '</div>';
                            }
                            
                        }
                    }

                    medias += '</div>'+
                                    '<a data-slide="prev" href="#carousel-'+reportData[q]._id+'" class="left carousel-control">'+
                                        '<span class="icon-prev"></span>'+
                                    '</a>'+
                                    '<a data-slide="next" href="#carousel-'+reportData[q]._id+'" class="right carousel-control">'+
                                        '<span class="icon-next"></span>'+
                                    '</a>'+
                                '</div>';
                }
                timeline_el += '<div class="social-feed-box">'+

                                    '<div class="pull-right social-action dropdown">'+
                                        '<button data-toggle="dropdown" class="dropdown-toggle btn-white">'+
                                            '<i class="fa fa-angle-down"></i>'+
                                        '</button>'+
                                        '<ul class="dropdown-menu m-t-xs">'+
                                            '<li><a reportid="'+reportData[q]._id+'" class="timeline-detail-btn">Detail</a></li>'+
                                        '</ul>'+
                                    '</div>'+
                                    '<div class="social-avatar">'+
                                        '<a href="" class="pull-left">'+
                                            '<img alt="image" src="img/a4.jpg">'+ // TODO: link ke avatar user
                                        '</a>'+
                                        '<div class="media-body">'+
                                            '<a href="#">'+
                                                author +
                                            '</a>'+
                                            '<small class="text-muted">'+ reportData[q].createdAt.substr(0, reportData[q].createdAt.indexOf('T')) + " " + reportData[q].createdAt.substr(reportData[q].createdAt.indexOf('T')+1, 8) +'</small>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="social-body">'+
                                        title +
                                        '<p>'+
                                            reportData[q].text+
                                        '</p>'+
                                        reportStatus + 
                                        '<div>&nbsp;</div>'+
                                        medias +
                                    '</div>'+
                                    '<div class="social-footer">'+


                                        '<div class="social-comment">'+
                                            '<a href="" class="pull-left">'+
                                                '<img alt="image" src="img/a8.jpg">'+ // TODO: link ke avatar user
                                            '</a>'+
                                            '<div class="media-body">'+
                                                '<a href="#">'+
                                                    'Andrew Williams '+
                                                '</a>'+
                                                'Making this the first true generator on the Internet. It uses a dictionary of.'+
                                                '<br/>'+
                                                '<small class="text-muted">10.07.2014</small>'+
                                            '</div>'+
                                        '</div>'+

                                        '<div class="social-comment">'+
                                            '<a href="" class="pull-left">'+
                                                '<img alt="image" src="img/a3.jpg">'+ // TODO: link ke avatar user
                                            '</a>'+
                                            '<div class="media-body">'+
                                                '<textarea class="form-control" placeholder="Write comment..."></textarea>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>';

                if($('#left-row').children().length > $('#right-row').children().length){
                    $('#right-row').append(timeline_el);
                } else {
                    $('#left-row').append(timeline_el);
                }


            }
            if(reportData.length === 0){
                $('#btn-loadmore').html('No More Feeds');
                $('#btn-loadmore').addClass('hidden');
            } else {
                start = start+limit;        
                $('#btn-loadmore').toggleClass('disabled');
            }
        },
        error: function(xhr, status, err){
            // TODO
            $('#btn-loadmore').toggleClass('disabled');
        }
    });
}
$(document).ready(function(){
    
    loadTimeline();

    $('#btn-loadmore').off('click');
    $('#btn-loadmore').on('click', function(){
        $(this).toggleClass('disabled');
        loadTimeline();
    });
    
    $('#left-row, #right-row').on('click', '.timeline-detail-btn', function(){
        var me = $(this);
        var reportid = me.attr('reportid');
       
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
                            if(detailreport.statuses[i] !== undefined){
                                if(i == detailreport.statuses.length-1){
                                    var dateori = new Date(detailreport.statuses[i].createdAt);
                                    var dateString = (dateori.getDate()<9?"0"+dateori.getDate():dateori.getDate()) + '-' + ((dateori.getMonth()+1)<9?"0"+(dateori.getMonth()+1):(dateori.getMonth()+1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours()<9?"0"+dateori.getHours():dateori.getHours()) + ':' + (dateori.getMinutes()<9?"0"+dateori.getMinutes():dateori.getMinutes()) + ':' + (dateori.getSeconds()<9?"0"+dateori.getSeconds():dateori.getSeconds());
                                
                                    bodyel2 += '<span class="timeline-label">'+
                                                    '<span class="label label-primary">'+dateString+'</span>'+
                                                '</span>'+
                                                '<div class="timeline-item">'+
                                                    '<div class="timeline-point timeline-point-warning">'+
                                                        '<i class="fa fa-clock-o"></i>'+
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
                                } else {
                                    var dateori = new Date(detailreport.statuses[i+1].createdAt);
                                    var dateString = (dateori.getDate()<9?"0"+dateori.getDate():dateori.getDate()) + '-' + ((dateori.getMonth()+1)<9?"0"+(dateori.getMonth()+1):(dateori.getMonth()+1)) + '-' + dateori.getFullYear() + ' ' + (dateori.getHours()<9?"0"+dateori.getHours():dateori.getHours()) + ':' + (dateori.getMinutes()<9?"0"+dateori.getMinutes():dateori.getMinutes()) + ':' + (dateori.getSeconds()<9?"0"+dateori.getSeconds():dateori.getSeconds());
                                
                                    bodyel2 += '<span class="timeline-label">'+
                                                    '<span class="label label-primary">'+dateString+'</span>'+
                                                '</span>'+
                                                '<div class="timeline-item">'+
                                                    '<div class="timeline-point timeline-point-success">'+
                                                        '<i class="fa fa-check"></i>'+
                                                    '</div>'+
                                                    '<div class="timeline-event">'+
                                                        '<div class="timeline-heading">'+
                                                            '<h4>'+steps[i].name+'</h4>'+
                                                        '</div>'+
                                                        '<div class="timeline-body">'+
                                                            '<p>'+steps[i].description+'</p>'+
                                                        '</div>'+
                                                        '<div class="timeline-footer">'+
                                                            '<p class="text-right">finished on '+dateString+'</p>'+
                                                        '</div>'+
                                                    '</div>'+
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
    
    $('body').on('click', '.img-preview', function(event){
        event = event || window.event;
        var target = event.target || event.srcElement,
            link = target.src ? target.parentNode : target,
            options = {index: link, event: event},
            links = this.getElementsByTagName('a');
        blueimp.Gallery(links, options);
    })
});