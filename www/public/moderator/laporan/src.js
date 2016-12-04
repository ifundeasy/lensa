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

var reportdata = {};
var nextreportid = '';


function getNextReport(){
    $.ajax({
        method: 'GET',
        url:'/moderator/!/nextreport',
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
                $('#btn-reject').off('click');
                $('#btn-duplicate').off('click');

                $('#btn-disposisi').removeAttr('disabled');
                $('#btn-reject').removeAttr('disabled');
                $('#btn-duplicate').removeAttr('disabled');

                nextreportid = nextreport._id;
                console.log("next report: ");
                console.log(nextreport);
                $('#btn-disposisi').on('click', function(){
                    $(this).attr('disabled', '');
                    getAllRolesAndCategories();
                    
                });

                $('#btn-reject').on('click', function(){
                    
                    // modal creation
                    modal.setTitle('Reject Report'); 

                    var modalBody = '<h2 id="modal-reason-label">Reason :</h2>'+
                                    '<textarea class="form-control" rows="3" id="reject-reason"></textarea>';
                    modal.setBody(modalBody).show();

                    modal.$buttons.OK.off("click");
                    modal.$buttons.OK.on("click", function () {
                        if($('#reject-reason').val().length > 10){
                            setReject(nextreportid, $('#reject-reason').val());
                        } else {
                            $( '<div class="panel panel-danger"><div class="panel-heading">Reason should not less than 10 characters</div></div>' ).insertAfter( "#modal-reason-label" );
                        }
                        
                    });

                });

                $('#btn-duplicate').on('click', function(){
                    
                    // modal creation
                    modal.setTitle('Laporan Duplikat'); 
                    
                    var modalBody = '<h2>Select Previous Report :</h2>'+
                                    '<table id="duplicate-list-report" class="table-responsive table table-striped table-bordered table-hover">'+
                                        '<thead>'+
                                            '<tr>'+
                                                '<th hidden>ID</th>'+
                                                '<th>Title</th>'+
                                                '<th>Description</th>'+
                                                '<th>Author</th>'+
                                                '<th>Date</th>'+
                                                '<th>Select</th>'+
                                            '</tr>'+
                                        '</thead>'+
                                        '<tbody>'+
                                            
                                        '</tbody>'+
                                    '</table>';
                    modal.setBody(modalBody).show();

                    setTimeout(function(){
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
                                                '<td><a class="btn btn-primary btn-duplicate"><span class="glyphicon glyphicon-ok"></span></a></td>'+
                                            '</tr>';

                            
                        }
                        $('#duplicate-list-report tbody').html(tabelRows);

                        $('#duplicate-list-report').DataTable({
                            "columnDefs": [
                                {
                                    "targets": 0,
                                    "visible": false,
                                    "searchable": false
                                }
                            ]
                        });

                        $( "#duplicate-list-report tbody" ).on( "click", "tr", function() {
                            //console.log( $( this ).text() );
                            var data = $('#duplicate-list-report').dataTable().fnGetData(this);
                            console.log(data);
                            if (confirm("Choose this report as a duplicate to a new one?") == true) {
                                setDuplicate(nextreportid, data[0]);
                            }
                        });
                    }, 500);

                    modal.$buttons.OK.off("click");
                    modal.$buttons.OK.on("click", function () {
                        
                    });
                });
            }
            $('.ibox-content').eq(0).css('display', 'block');
        },
        error: function(xhr, status, err){
            // TODO
        }
    });
}

function getAllRolesAndCategories(){
    $.ajax({
        url:'/moderator/!/allrolesandcategories',
        success: function(data, status, xhr){
            $('#btn-disposisi').removeAttr('disabled');
            var roleData = data.roledata;
            var categoryData = data.categorydata;
            console.log(data);
            // modal creation
            modal.setTitle('Assign Report');

            var categoryOptions = '<option value="0"> -- Select Category -- </option>';
            for(x=0; x<categoryData.length; x++){
                categoryOptions += '<option value="'+categoryData[x]._id+'">'+categoryData[x].name+'</option>';
            }

            var roleOptions = '<option value="0"> -- Select Division -- </option>';
            for(x=0; x<roleData.length; x++){
                roleOptions += '<option value="'+roleData[x]._id+'">'+roleData[x].name+'</option>';
            }

            var modalBody = '<h2>Select Category</h2>'+
                            '<select id="category-select">' +
                                categoryOptions +
                            '</select>'+
                            '<h2>Select Division</h2>'+
                            '<select id="role-select">' +
                                roleOptions +
                            '</select>'+
                            '<h2>Select Admin</h2>'+
                            '<select id="admin-select">' +
                                '<option value="0"> -- Select Admin -- </option>' +
                            '</select>';
            modal.setBody(modalBody).show();

            setTimeout(function(){
                $('#role-select').off('change');
                $('#role-select').on('change', function(){
                    if($(this).val() !== '0'){
                        $('#admin-select').html('<option value="0"> Loading admin data.. </option>');
                        getAllAdminRoles($(this).val());
                    } else {
                        $('#admin-select').html('');
                    }
                });
            }, 300);

            modal.$buttons.OK.off("click");
            modal.$buttons.OK.on("click", function () {
                if($('#admin-select').val() == '0' || $('#admin-select').val() == null){
                    alert("Invalid Admin ID");
                } else {
                    if($('#role-select').val() == '0' || $('#role-select').val() == null){
                        alert("Invalid Role ID");
                    } else {
                        if($('#category-select').val() == '0' || $('#category-select').val() == null){
                            alert("Invalid Category ID");
                        } else {
                            modal.$buttons.OK.html('assigning..');
                            modal.$buttons.OK.addClass('disabled');
                            setAssign(nextreportid, $('#admin-select').val(), $('#category-select').val());
                        }
                    }
                }
            });
            
        },
        error: function(xhr, status, err){
            // TODO
        }
    });
}

function getAllAdminRoles(roleid){
    $.ajax({
        url:'/moderator/!/alladminroles?roleid=' + roleid,
        success: function(data, status, xhr){
            var adminData = data.data;
            console.log("all admin roles: ");
            console.log(adminData);
            var adminOptions = '';
            for(q=0; q<adminData.length; q++){
                adminOptions += '<option value="'+adminData[q]._id+'">'+adminData[q].name.first + ' ' + adminData[q].name.last +'</option>';
            }
            $('#admin-select').html(adminOptions);
        },
        error: function(xhr, status, err){
            // TODO
        }
    });
}

function getAllreports(){
    $.ajax({
        method: 'GET',
        url: '/moderator/!/allreports',
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
                                        '<td>'+ reportTitle +'</td>'+
                                        '<td>'+ reportdata[i].text +'</td>'+
                                        '<td>'+ reportdata[i].users._id.name.first +'</td>'+
                                        '<td>'+ reportdata[i].createdAt.substr(0, reportdata[i].createdAt.indexOf('T')) + " " + reportdata[i].createdAt.substr(reportdata[i].createdAt.indexOf('T')+1, 8) +'</td>'+
                                        '<td><a class="btn btn-default btn-detail"><span class="glyphicon glyphicon-search"></span></a></td>'+
                                    '</tr>';

                    
                }
                $('#table-list-report tbody').html(tabelRows);

                $('#table-list-report').DataTable({
                    "columnDefs": [
                        {
                            "targets": 0,
                            "visible": false,
                            "searchable": false
                        }
                    ]
                } );

                $( "#table-list-report tbody" ).on( "click", "tr", function() {
                    //console.log( $( this ).text() );
                    var rowdata = $('#table-list-report').dataTable().fnGetData(this);
                    console.log(rowdata);
                    //asdf
                    $.get('/.assets/html/reportdetail.html')
                     .success(function(eldata) {
                        var bodyel = eldata;
                        modal2.setTitle('Report Detail');
                        modal2.setBody(bodyel).show();
                        modal2.$buttons.OK.off("click");
                        modal2.$buttons.OK.on("click", function () {    
                        });
                        var modalselector = '#'+modal2.id;
                        $(modalselector + ' .modal-dialog').css("width", "80%");
                        $.ajax({
                            url:'/moderator/!/reportdetail?postid='+rowdata[0],
                            success: function(detaildata, status, xhr){
                                console.log(detaildata);
                                if(detaildata.status !==0){
                                    var detailreport = detaildata.data;
                                    var reportTitle = 'Untitled Report';
                                    var reportAuthor = detailreport.users._id.name.first;
                                    if(detailreport.users._id.name.hasOwnProperty('last') && detailreport.users._id.name.last != null){
                                        reportAuthor = detailreport.users._id.name.first + ' ' + detailreport.users._id.name.last;
                                    }
                                    if(detailreport.hasOwnProperty('title')){
                                        reportTitle = detailreport.title;
                                    }
                    
                                    $(modalselector + ' .report-title').html(reportTitle);
                                    $(modalselector + ' .report-author').html(reportAuthor);
                                    $(modalselector + ' .report-date').html(detailreport.createdAt.substr(0, detailreport.createdAt.indexOf('T')) + " " + detailreport.createdAt.substr(detailreport.createdAt.indexOf('T')+1, 8));
                                    $(modalselector + ' .report-content').html(detailreport.text);
                                    if(detailreport.hasOwnProperty('media')){
                                        if(detailreport.media._ids.length > 0){
                                            $(modalselector + ' .carousel-laporan .carousel-inner').html('');
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
                                            $(modalselector + ' .carousel-laporan .carousel-inner').html(medias);
                                        }
                                    }
                                    $(modalselector + ' .pr-timeline-btn').off('click');
                                    $(modalselector + ' .pr-timeline-btn').on('click', function(e){
                                        $.get('/.assets/html/timeline.html')
                                        .success(function(eldata2) {
                                            var bodyel2 = eldata2;
                                            modal3.setTitle('Progress Timeline');
                                            modal3.setBody(bodyel2).show();
                                            modal3.$buttons.OK.off("click");
                                            modal3.$buttons.OK.on("click", function () {    
                                            });
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

function setAssign(postId, userId, categoryId){
    $.ajax({
        method: 'POST',
        url: '/moderator/!/assign',
        data: {
            postid: postId,
            userid: userId,
            categoryid: categoryId
        },
        success: function(data, status, xhr){
            if(data.status!==1){
                alert("Failed to assign report!");
                modal.$buttons.OK.html('OK');
                modal.$buttons.OK.removeClass('disabled');
            } else {
                location.reload();
                modal.$buttons.OK.html('Success. Reloading..');
            }
        },
        error: function(xhr, status, err){
            //TODO
            modal.$buttons.OK.html('OK');
            modal.$buttons.OK.removeClass('disabled');
        }
    });
}

function setReject(postId, reason){
    $.ajax({
        method: 'POST',
        url: '/moderator/!/markreject',
        data: {
            postid: postId,
            reason: reason
        },
        success: function(data, status, xhr){
            if(data.status!==1){
                alert("Failed to update report status!");
            } else {
                location.reload();
            }
        },
        error: function(xhr, status, err){
            // TODO 
        }
    });
}

function setDuplicate(postId, duplicateId){
    $( "#duplicate-list-report tbody" ).off( "click");
    $.ajax({
        method: 'POST',
        url: '/moderator/!/markduplicate',
        data: {
            postid: postId,
            duplicateid: duplicateId
        },
        success: function(data, status, xhr){
            if(data.status==1){
                location.reload();
            } else {
                alert("Failed to mark report as duplicate!");
            }
        },
        error: function(xhr, status, err){
            // TODO
        }
    });
}

$(document).ready(function(){
    // get next report
    getNextReport();
    
    // get all report data
    getAllreports();
    
});