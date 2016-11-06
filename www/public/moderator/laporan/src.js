// modal detail 
var modal = new Modal({
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
                $('.ibox-content').eq(0).html('<h1>Tidak ada laporan masuk</h1>');
            } else {
                var nextreport = data.data[0];
                var reportTitle = 'Laporan Tanpa Judul';
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
                    getAllRoles();
                    
                });

                $('#btn-reject').on('click', function(){
                    
                    // modal creation
                    modal.setTitle('Tolak Laporan'); 

                    var modalBody = '<h2>Alasan laporan ditolak:</h2>'+
                                    '<textarea class="form-control" rows="3" id="reject-reason"></textarea>';
                    modal.setBody(modalBody).show();

                    modal.$buttons.OK.off("click");
                    modal.$buttons.OK.on("click", function () {
                        setReject(nextreportid, $('#reject-reason').val());
                    });

                });

                $('#btn-duplicate').on('click', function(){
                    
                    // modal creation
                    modal.setTitle('Laporan Duplikat'); 
                    
                    var modalBody = '<h2>Pilih laporan terdahulu:</h2>'+
                                    '<table id="duplicate-list-report" class="table-responsive table table-striped table-bordered table-hover">'+
                                        '<thead>'+
                                            '<tr>'+
                                                '<th>ID</th>'+
                                                '<th>Judul</th>'+
                                                '<th>Deskripsi</th>'+
                                                '<th>Pelapor</th>'+
                                                '<th>Tanggal</th>'+
                                                '<th>Pilih</th>'+
                                            '</tr>'+
                                        '</thead>'+
                                        '<tbody>'+
                                            
                                        '</tbody>'+
                                    '</table>';
                    modal.setBody(modalBody).show();

                    setTimeout(function(){
                        var tabelRows = '';
                        for(i=0; i<reportdata.length; i++){
                            var reportTitle = 'Laporan Tanpa Judul';
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
                            if (confirm("Pilih laporan ini sebagai duplikasi dari laporan yang baru?") == true) {
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

function getAllRoles(){
    $.ajax({
        url:'/moderator/!/allroles',
        success: function(data, status, xhr){
            $('#btn-disposisi').removeAttr('disabled');
            var roleData = data.data;
            console.log("all roles: ");
            console.log(roleData);

            // modal creation
            modal.setTitle('Disposisi Laporan');

            var roleOptions = '<option value="0"> -- Pilih Divisi -- </option>';
            for(x=0; x<roleData.length; x++){
                roleOptions += '<option value="'+roleData[x]._id+'">'+roleData[x].name+'</option>';
            }

            var modalBody = '<h2>Pilih Disivi</h2>'+
                            '<select id="role-select">' +
                                roleOptions +
                            '</select>'+
                            '<h2>Pilih Admin</h2>'+
                            '<select id="admin-select">' +
                                '<option value="0"> -- Pilih Admin -- </option>' +
                            '</select>';
            modal.setBody(modalBody).show();

            setTimeout(function(){
                $('#role-select').off('change');
                $('#role-select').on('change', function(){
                    if($(this).val() !== '0'){
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
                    setAssign(nextreportid, $('#admin-select').val());
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
                    var reportTitle = 'Laporan Tanpa Judul';
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
                    var data = $('#table-list-report').dataTable().fnGetData(this);
                    console.log(data);
                });

            } else {
                var r = confirm("Gagal memuat data laporan. Muat ulang halaman?");
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

function setAssign(postId, userId){
    $.ajax({
        method: 'POST',
        url: '/moderator/!/assign',
        data: {
            postid: postId,
            userid: userId
        },
        success: function(data, status, xhr){
            if(data.status!==1){
                alert("Gagal men-disposisi laporan!");
            } else {
                location.reload();
            }
        },
        error: function(xhr, status, err){

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
                alert("Gagal mengubah status laporan!");
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
                alert("aggal menandai duplikasi laporan!");
                $( "#duplicate-list-report tbody" ).on( "click", "tr", function() {
                    //console.log( $( this ).text() );
                    var data = $('#duplicate-list-report').dataTable().fnGetData(this);
                    if (confirm("Pilih laporan ini sebagai duplikasi dari laporan yang baru?") == true) {
                        setDuplicate(nextreportid, data[0]);
                    }
                });
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