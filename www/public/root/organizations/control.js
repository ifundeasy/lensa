$(document).ready(function () {
    var table = $('.dataTables-example');
    var collection = $("#tableName");
    for (var m in App.models) {
        var model = App.models[m]
        var el = toTitleCase(splitCamelCase(model));
        collection.append('<option value="' + m + '">' + el + '</option>');
    }
    collection.chosen({no_results_text : "Oops, nothing found!", width : "100%"});
    $.ajax({
        method : "GET",
        dataType : "json",
        url : "/api/usergrouproles?" + $.param({limit : 1000})
    }).success(function (res) {
        console.log(res.data);
        if (res.data.total) {
            var rows = res.data.rows;
            rows.forEach(function (row) {
                var tr = $('<tr>');
                var routes = $('<td>')
                tr.data(row);
                tr.append("<td>" + row.name + "</td>")
                if (row.routes && typeof row.routes == "object") {
                    row.routes.forEach(function (route) {
                        var btn = $("<input type='button' class='btn btn-xs btn-default'>")
                        btn.val(route.model)
                        btn.data(route);
                        routes.append(btn);
                    })
                }
                tr.append(routes)
                tr.append("<td>" + (row.notes || "") + "</td>")
                tr.append("<td><input type='button' class='btn btn-xs btn-danger' value='delete'></td>")
                table.find('tbody').append(tr)
            })
            table.DataTable({
                pageLength : 2,
                responsive : true,
                dom : '<"html5buttons"B>lTfgitp',
                buttons : [
                    {extend : 'copy'},
                    {extend : 'csv'},
                    {extend : 'excel', title : 'ExampleFile'},
                    {extend : 'pdf', title : 'ExampleFile'},
                    {
                        extend : 'print',
                        customize : function (win) {
                            $(win.document.body).addClass('white-bg');
                            $(win.document.body).css('font-size', '10px');
                            $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                        }
                    }
                ]
            });
        }
    }).error(function (jqXHR, is, message) {
        console.error({
            is : is,
            message : message,
            response : jqXHR.responseJSON
        })
    });
})