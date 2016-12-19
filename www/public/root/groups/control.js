$(document).ready(function () {
    var clsColors = ["default", "success", "primary", "warning", "danger"];
    var url = "!/groups/";
    var isUpdate = false;
    var tempRoutes = undefined;
    var save = $('#save');
    var reset = $('#reset');
    var info = $('#info');
    var infoname = $('#info-name');
    var tcontainer = $('#table');
    //
    var name = $('#name');
    var routes = $('#routes');
    var notes = $('#notes');
    //
    var modal = new Modal({
        title: "Prompt",
        backdrop: true,
        handler: {
            OK: {class: "btn-success"},
            Cancel: {class: "btn-default", dismiss: true}
        }
    });
    var rolesPopUp = new Modal({
        backdrop: true,
        body: $(
            ["GET", "POST", "PUT", "DELETE"].map(function (m, i, all) {
                return (
                    '<div class="row">' +
                    '<label class="col-sm-2 control-label b-r">' + m + '</label>' +
                    '<div class="col-sm-10">' +
                    '<div class="col-sm-3">' +
                    '<label><input type="radio" value="block" name="' + m + '-routes"> Block</label>' +
                    '</div>' +
                    '<div class="col-sm-3">' +
                    '<label><input type="radio" value="self" name="' + m + '-routes"> Self</label>' +
                    '</div>' +
                    '<div class="col-sm-3">' +
                    '<label><input type="radio" value="restrict" name="' + m + '-routes"> Restrict</label>' +
                    '</div>' +
                    '<div class="col-sm-3">' +
                    '<label><input type="radio" value="all" name="' + m + '-routes"> All</label>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    (i < all.length - 1 ? '<div class="hr-line-dashed" style="margin:10px 0px;"></div>' : '')
                )
            }).join("")
            /* +
            '<label>Method role</label>' +
            '<select data-placeholder="Choose methods" class="chosen-select" multiple>' +
            '<option value="GET">Get</option>' +
            '<option value="POST">Post</option>' +
            '<option value="PUT">Put</option>' +
            '<option value="DELETE">Delete</option>' +
            '</select>'
            */
        ),
        handler: {
            Save: {class: "btn-success"},
            Cancel: {class: "btn-default", dismiss: true}
        }
    });
    var toastmsg = false;
    var twowew = function (obj) {
        obj.type = obj.type || "error";
        toastr.options = {
            closeButton: true,
            progressBar: true,
            newestOnTop: true,
            showMethod: 'slideDown',
            timeOut: obj.time || 10000
        };
        toastr[obj.type](obj.message, obj.title);
    }
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
    var init = function () {
        var chosenConfig = {no_results_text: "Oops, nothing found!", width: "100%"};
        for (var m in App.models) {
            var model = App.models[m]
            routes.append('<option value="' + m + '">' + model + '</option>');
        }
        routes.chosen(chosenConfig);
        //rolesPopUp.$body.find("select").chosen(chosenConfig);
        save.on('click', saving);
        reset.on('click', function () {
            isUpdate = false;
            info.text("Create");
            infoname.text("");
            name.val("");
            routes.val("").trigger("chosen:updated");
            notes.val("");
        });
        getting();
    }
    var getting = function () {
        var table = setTable();
        var putEmpty = function () {
            table.find('tbody').append(
                '<tr role="row" class="text-center">' +
                '<td colspan="' + table.find('thead tr th').length + '">Empty</td>' +
                '</tr>'
            );
        };
        $.ajax({
            method: "GET",
            dataType: "json",
            url: url + "?" + $.param({limit: 1000})
        }).error(function (jqXHR, is, message) {
            putEmpty();
            twowew({
                type: "error",
                title: "GET",
                message: jqXHR.responseJSON.message,
                time: 0
            });
            console.error("GET", jqXHR.responseJSON);
        }).success(function (res) {
            if (res.data.total) {
                var rows = res.data.rows;
                rows.forEach(function (row) {
                    var tr = $('<tr>');
                    var tdRoutes = $('<td>');
                    var action = $('<td>');
                    var deleteBtn = $("<button type='button' class='btn btn-xs btn-danger'><i class='fa fa-times'></i></button>")
                    row.notes = row.notes || "";
                    tr.data(row);
                    tr.append(action)
                    tr.append("<td>" + row.name + "</td>")
                    if (row.routes && typeof row.routes == "object") {
                        var data =
                            row.routes.forEach(function (route) {
                                route.methods = route.methods || [];
                                var cls = clsColors[route.methods.length];
                                var btn = $("<input type='button' class='btn btn-xs btn-outline btn-primary' style='margin-right: 3px'>")
                                btn.val(App.models[route.model])
                                btn.data(route);
                                btn.on("click", function () {
                                    //var selections = rolesPopUp.$body.find("select");
                                    var data = $(this).data();
                                    ["GET", "POST", "PUT", "DELETE"].forEach(function (m) {
                                        $('[name="' + m + '-routes"][value="' + (data[m] || "block") + '"]').prop('checked', true);
                                    });
                                    //selections.val(data.methods).trigger("chosen:updated");
                                    rolesPopUp.$buttons.Save.off("click");
                                    rolesPopUp.$buttons.Save.on("click", function () {
                                        rolesPopUp.hide();
                                        $.ajax({
                                            method: "PUT",
                                            dataType: "json",
                                            data: {
                                                nested: {
                                                    key: "routes._id",
                                                    value: data._id
                                                },
                                                docs: {
                                                    model: data.model,
                                                    GET: $('[name="GET-routes"]:checked').val(),
                                                    POST: $('[name="POST-routes"]:checked').val(),
                                                    PUT: $('[name="PUT-routes"]:checked').val(),
                                                    DELETE: $('[name="DELETE-routes"]:checked').val()
                                                    //methods : selections.val()
                                                }
                                            },
                                            url: url + tr.data('_id')
                                        }).error(function (jqXHR, is, message) {
                                            toastmsg = jqXHR.responseJSON.message;
                                            console.error("PUT", jqXHR.responseJSON)
                                        }).success(function (res) {
                                            reset.click();
                                            getting();
                                        }).complete(function () {
                                            twowew({
                                                type: toastmsg ? "error" : "success",
                                                title: "PUT",
                                                message: toastmsg || "success",
                                                time: toastmsg ? 0 : 3000
                                            })
                                            toastmsg = false;
                                        });
                                    });
                                    rolesPopUp.setTitle(tr.data("name") + " : " + App.models[data.model] + " role");
                                    rolesPopUp.show();
                                });
                                tdRoutes.append(btn);
                            })
                    }
                    tr.append(tdRoutes)
                    tr.append("<td>" + row.notes + "</td>")
                    action.append(deleteBtn);
                    tr.on("click", function (ev) {
                        var is = ev.target.nodeName;
                        var data = $(this).data();
                        if (["INPUT", "BUTTON", "I"].indexOf(is) == -1) {
                            tempRoutes = data.routes;
                            routes.val(tempRoutes.map(function (a) {
                                return a.model
                            }));
                            routes.trigger("chosen:updated");
                            info.text("Update");
                            modal.setTitle("Update : " + data.name);
                            infoname.text("\"" + data.name + "\"");
                            name.val(data.name);
                            notes.val(data.notes);
                            isUpdate = data._id;
                        }
                    });
                    deleteBtn.data({
                        id: row._id,
                        name: row.name
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
                                method: "DELETE",
                                dataType: "json",
                                url: url + tr.data('_id')
                            }).error(function (jqXHR, is, message) {
                                toastmsg = jqXHR.responseJSON.message;
                                console.error("DELETE", jqXHR.responseJSON)
                            }).success(function (res) {
                                reset.click();
                                getting();
                            }).complete(function () {
                                twowew({
                                    type: toastmsg ? "error" : "success",
                                    title: "DELETE",
                                    message: toastmsg || "success",
                                    time: toastmsg ? 0 : 3000
                                });
                                toastmsg = false;
                            });
                        });
                    })
                    table.find('tbody').append(tr)
                })
                table.DataTable({
                    pageLength: 5,
                    lengthMenu: [5, 10, 25, 50, 75, 100],
                    order: [[1, "asc"]],
                    responsive: false,
                    dom: '<"html5buttons"B>lTfgitp',
                    buttons: []
                });
            } else putEmpty();
        });
    }
    var saving = function () {
        var method = "POST";
        var url_ = url;
        var data = {
            name: name.val(),
            notes: notes.val(),
            routes: routes.val() || []
        };
        var save = function () {
            $.ajax({
                method: method,
                dataType: "json",
                data: data,
                url: url_
            }).error(function (jqXHR, is, message) {
                toastmsg = jqXHR.responseJSON.message;
                console.error(method, jqXHR.responseJSON)
            }).success(function (res) {
                reset.click();
                getting();
            }).complete(function () {
                twowew({
                    type: toastmsg ? "error" : "success",
                    title: method.toUpperCase(),
                    message: toastmsg || "success",
                    time: toastmsg ? 0 : 3000
                })
                toastmsg = false;
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
                    model: route,
                    methods: ["GET", "POST", "PUT", "DELETE"]
                }
            }).concat(newState);
            data = {docs: data};
        } else {
            data.routes = data.routes.map(function (route) {
                return {
                    model: route,
                    methods: ["GET", "POST", "PUT", "DELETE"]
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