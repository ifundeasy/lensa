//todo : notification (when error ajax);
//todo : routing management, (method PUT, triggering when click button inside routes columns), please using messagebox.
//
$(document).ready(function () {
    var url = "/api/usergrouproles/";
    var isUpdate = false;
    var tempRoutes = undefined;
    var tcontainer = $('#table');
    var collection = $("#tableName");
    var name = $('#name');
    var notes = $('#notes');
    var save = $('#save');
    var reset = $('#reset');
    var form = $('#form');
    var info = $('#info');
    var infoname = $('#info-name');
    var modal = new Modal({
        title : "Prompt",
        backdrop : true,
        handler : {
            OK : {class : "btn-success"},
            Cancel : {class : "btn-default", dismiss : true}
        }
    });
    var setTable = function () {
        var table = $(
            '<table class="table table-striped table-bordered table-hover">' +
            '<thead>' +
            '<tr>' +
            '<th></th>' +
            '<th>Name</th>' +
            '<th>Routes</th>' +
            '<th>Notes</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody></tbody>' +
            '</table>'
        );
        tcontainer.html("");
        tcontainer.append(table);
        return table;
    }
    for (var m in App.models) {
        var model = App.models[m]
        collection.append('<option value="' + m + '">' + model + '</option>');
    }
    collection.chosen({no_results_text : "Oops, nothing found!", width : "100%"});
    var init = function () {
        save.on('click', saving);
        reset.on('click', function () {
            isUpdate = false
            info.text("Create");
            infoname.text("");
            name.val("");
            collection.val("").trigger("chosen:updated");
            notes.val("");
        });
        getting();
    }
    var getting = function () {
        var table = setTable();
        $.ajax({
            method : "GET",
            dataType : "json",
            url : url + "?" + $.param({limit : 1000})
        }).error(function (jqXHR, is, message) {
            console.error("GET", {
                is : is,
                message : message,
                response : jqXHR.responseJSON
            })
        }).success(function (res) {
            if (res.data.total) {
                var rows = res.data.rows;
                rows.forEach(function (row) {
                    var tr = $('<tr>');
                    var routes = $('<td>');
                    var action = $('<td>');
                    var deleteBtn = $("<button type='button' class='btn btn-xs btn-danger'><i class='fa fa-times'></i></button>")
                    row.notes = row.notes || "";
                    tr.data(row);
                    tr.append(action)
                    tr.append("<td>" + row.name + "</td>")
                    if (row.routes && typeof row.routes == "object") {
                        row.routes.forEach(function (route) {
                            var btn = $("<input type='button' class='btn btn-xs btn-default' style='margin-right: 3px'>")
                            btn.val(App.models[route.model])
                            btn.data(route);
                            routes.append(btn);
                        })
                    }
                    tr.append(routes)
                    tr.append("<td>" + row.notes + "</td>")
                    action.append(deleteBtn);
                    tr.on("click", function (ev) {
                        var is = ev.target.nodeName;
                        if (["INPUT", "BUTTON", "I"].indexOf(is) == -1) {
                            var data = $(this).data();
                            tempRoutes = data.routes;
                            collection.val(tempRoutes.map(function (a) {
                                return a.model
                            }));
                            collection.trigger("chosen:updated");
                            info.text("Update");
                            modal.setTitle("Update : " + data.name);
                            infoname.text("\"" + data.name + "\"");
                            name.val(data.name);
                            notes.val(data.notes);
                            isUpdate = data._id;
                        }
                    });
                    deleteBtn.data({
                        id : row._id,
                        name : row.name
                    });
                    deleteBtn.on("click", function () {
                        modal
                        .setTitle("Delete : " + $(this).data('name'))
                        .setBody("Are you sure want to remove these?")
                        .show();
                        modal.$buttons.OK.off("click");
                        modal.$buttons.OK.on("click", function () {
                            modal.hide();
                            $.ajax({
                                method : "DELETE",
                                dataType : "json",
                                url : url + $(this).data('id')
                            }).error(function (jqXHR, is, message) {
                                console.error(method, {
                                    is : is,
                                    message : message,
                                    response : jqXHR.responseJSON
                                })
                            }).success(function (res) {
                                reset.click();
                                getting();
                            });
                        });
                    })
                    table.find('tbody').append(tr)
                })
                table.DataTable({
                    pageLength : 5,
                    lengthMenu : [5, 10, 25, 50, 75, 100],
                    order : [[1, "desc"]],
                    responsive : false,
                    dom : '<"html5buttons"B>lTfgitp',
                    buttons : []
                });
            }
        });
    }
    var saving = function () {
        var method = "POST";
        var url_ = url;
        var data = {
            name : name.val(),
            notes : notes.val(),
            routes : collection.val() || []
        };
        var save = function () {
            $.ajax({
                method : method,
                dataType : "json",
                data : data,
                url : url_
            }).error(function (jqXHR, is, message) {
                console.error(method, {
                    is : is,
                    message : message,
                    response : jqXHR.responseJSON
                })
            }).success(function (res) {
                reset.click();
                getting();
            });
        }
        if (isUpdate) {
            method = "PUT";
            url_ = url + isUpdate;
            var currentState = tempRoutes.map(function (el) {
                return el.model
            });
            var newState = tempRoutes.filter(function (route) {
                if (data.routes.indexOf(route.model) > -1) return 1
                return 0;
            });
            data.routes = data.routes.filter(function (route) {
                if (currentState.indexOf(route) == -1) return 1;
                return 0;
            }).map(function (route) {
                return {
                    model : route,
                    methods : ["GET", "POST", "PUT", "DELETE"]
                }
            }).concat(newState);
        } else {
            data.routes = data.routes.map(function (route) {
                return {
                    model : route,
                    methods : ["GET", "POST", "PUT", "DELETE"]
                }
            })
        }
        if (method == "PUT") {
            modal.setBody("Are you sure want to save these changes?").show();
            modal.$buttons.OK.off("click");
            modal.$buttons.OK.on("click", function () {
                modal.hide();
                save()
            });
        } else {
            save()
        }
    };
    //
    init();
})