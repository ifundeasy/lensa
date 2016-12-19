$(document).ready(function () {
    var clsColors = ["default", "success", "primary", "warning", "danger"];
    var url = "!/roles/";
    var isUpdate = false;
    var save = $('#save');
    var reset = $('#reset');
    var info = $('#info');
    var infoname = $('#info-name');
    var tcontainer = $('#table');
    //
    var id = undefined;
    var name = $('#name');
    var description = $('#description');
    var notes = $('#notes');
    //
    var modal = new Modal({
        title: "Prompt",
        backdrop: true,
        handler: {
            OK: {
                class: "btn-success"
            },
            Cancel: {
                class: "btn-default",
                dismiss: true
            }
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
    };
    var setTable = function () {
        var table = $(
            '<table class="table table-striped table-bordered table-hover">' +
            '<thead>' +
            '<tr>' +
            '<th></th>' +
            '<th>Name</th>' +
            '<th>Description</th>' +
            '<th>Notes</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody></tbody>' +
            '</table>'
        );
        tcontainer.html("");
        tcontainer.append(table);
        return table;
    };
    var init = function () {
        save.on('click', saving);
        reset.on('click', function () {
            isUpdate = false;
            info.text("Create");
            infoname.text("");
            name.val("");
            description.val("");
            notes.val("");
        });
        gettingOrg();
        getting();
    };
    var gettingOrg = function () {
        $.ajax({
            asyc: false,
            method: "GET",
            dataType: "json",
            url: "!/organizations"
        }).error(function (jqXHR, is, message) {
            twowew({
                type: "error",
                title: "GET",
                message: jqXHR.responseJSON.message,
                time: 0
            });
            console.error("GET", jqXHR.responseJSON);
        }).success(function (res) {
            if (res.data.total) {
                var row = res.data.rows[0];
                id = row._id;
            }
        });
    };
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
            url: url + "?" + $.param({
                limit: 1000
            })
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
                    var action = $('<td>');
                    var deleteBtn = $("<button type='button' class='btn btn-xs btn-danger'><i class='fa fa-times'></i></button>");
                    row.notes = row.notes || "";
                    tr.data(row);
                    tr.append(action);
                    tr.append("<td>" + row.name + "</td>");
                    tr.append("<td>" + row.description + "</td>");
                    tr.append("<td>" + row.notes + "</td>");
                    action.append(deleteBtn);
                    tr.on("click", function (ev) {
                        var is = ev.target.nodeName;
                        var data = $(this).data();
                        if (["INPUT", "BUTTON", "I"].indexOf(is) == -1) {
                            info.text("Update");
                            modal.setTitle("Update : " + data.name);
                            infoname.text("\"" + data.name + "\"");
                            name.val(data.name);
                            description.val(data.description);
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
                                console.error("DELETE", jqXHR.responseJSON);
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
                    });
                    table.find('tbody').append(tr);
                });
                table.DataTable({
                    pageLength: 5,
                    lengthMenu: [5, 10, 25, 50, 75, 100],
                    order: [
                        [1, "asc"]
                    ],
                    responsive: false,
                    dom: '<"html5buttons"B>lTfgitp',
                    buttons: []
                });
            } else putEmpty();
        });
    };
    var saving = function () {
        var method = "POST";
        var url_ = url;
        var data = {
            name: name.val(),
            "organizations._id": id,
            description: description.val(),
            notes: notes.val()
        };
        var save = function () {
            $.ajax({
                method: method,
                dataType: "json",
                data: data,
                url: url_
            }).error(function (jqXHR, is, message) {
                toastmsg = jqXHR.responseJSON.message;
                console.error(method, jqXHR.responseJSON);
            }).success(function (res) {
                reset.click();
                getting();
            }).complete(function () {
                twowew({
                    type: toastmsg ? "error" : "success",
                    title: method.toUpperCase(),
                    message: toastmsg || "success",
                    time: toastmsg ? 0 : 3000
                });
                toastmsg = false;
            });
        };
        if (isUpdate) {
            method = "PUT";
            url_ = url + isUpdate;
            data = {
                docs: data
            };
        }
        if (method == "PUT") {
            modal.setBody("Are you sure want to save these changes?").show();
            modal.$buttons.OK.off("click");
            modal.$buttons.OK.on("click", function () {
                modal.hide();
                save();
            });
        } else {
            save();
        }
    };
    //
    init();
});
