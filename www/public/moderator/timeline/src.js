// modal detail 
var modal = new Modal({
    title : "Prompt",
    backdrop : true,
    handler : {
        OK : {class : "btn-success"},
        Cancel : {class : "btn-default", dismiss : true}
    }
});

var start = 0;
var limit = 10;

function loadTimeline(){
    $.ajax({
        url:'/moderator/!/timeline?start=' + start + '&limit=' + limit,
        success: function(data, status, xhr){
            var reportData = data.data;
            console.log(reportData);
            for(q=0; q<reportData.length; q++){
                var timeline_el = '';
                var author = reportData[q].users._id.name.last===null? reportData[q].users._id.name.first : reportData[q].users._id.name.first + ' ' + reportData[q].users._id.name.last;
                var reportStatus = '';
                if(reportData[q].assignTo.hasOwnProperty('users')){
                    if(reportData[q].hasOwnProperty('returned') && reportData[q].returned){
                        // returned
                        reportStatus = '<span class="badge badge-warning">Returned</span>';
                    } else {
                        reportStatus = '<span class="badge badge-success">On Progress</span>';
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
                    for(lol=0; lol<reportData[q].media._ids.length; lol++){
                        if(lol==0){
                            medias += '<div class="item active">'+
                                            '<img alt="image" class="img-responsive" src="/img/post/'+reportData[q].media._ids[lol].directory+'">'+
                                        '</div>';
                        } else {
                            medias += '<div class="item">'+
                                            '<img alt="image" class="img-responsive" src="/img/post/'+reportData[q].media._ids[lol].directory+'">'+
                                        '</div>';
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
                                            '<li><a href="#">Detail</a></li>'+
                                        '</ul>'+
                                    '</div>'+
                                    '<div class="social-avatar">'+
                                        '<a href="" class="pull-left">'+
                                            '<img alt="image" src="img/a4.jpg">'+
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
                                                '<img alt="image" src="img/a8.jpg">'+
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
                                                '<img alt="image" src="img/a3.jpg">'+
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
    
});