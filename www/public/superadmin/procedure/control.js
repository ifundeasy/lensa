$(document).ready(function () {
    var clsColors = ["default", "success", "primary", "warning", "danger"];
    var url = "!/procedures/";
    var lastStepNumber = 1;
    var isUpdate = false;
    var isUpdateModal = false;
    var save = $('#save');
    var reset = $('#reset');
    var saveModal = '';
    var resetModal = '';
    var info = $('#info');
    var infoname = $('#info-name');
    var tcontainer = $('#table');
    //
    var name = $('#name');
    var category = $('#category');
    var role = $('#role');
    var description = $('#description');
    var notes = $('#notes');
    var nameModal = '';
    var descriptionModal = '';
    var durationModal = '';
    var procedure_id = '';
    var procedure_name = '';
    //
    var modal = new Modal({
        title: "Prompt",
        backdrop: true,
        handler: {
            OK: {class: "btn-success"},
            Cancel: {class: "btn-default", dismiss: true}
        }
    });
    var modal2 = new Modal({
        title: "Prompt",
        backdrop: true,
        handler: {
            OK: {class: "btn-success"},
            Cancel: {class: "btn-default", dismiss: true}
        }
    });
    var modal3 = new Modal({
        title: "Prompt",
        backdrop: true,
        handler: {
            OK: {class: "btn-success"},
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
            '<th>Description</th>' +
            '<th>Category</th>' +
            '<th>Department</th>' +
            '<th>Steps</th>' +
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
        save.on('click', saving);
        reset.on('click', function () {
            isUpdate = false;
            isUpdateModal = false;
            info.text("Create");
            infoname.text("");
            name.val("");
            description.val("");
            notes.val("");
        });
        gettingCategory();
        gettingRoles();
        getting();
    }

    var getSteps = function () {

        var modalselector = '#' + modal2.id;
        $(modalselector + ' .modal-dialog').css("width", "80%");
        $(modalselector + ' .modal-dialog .modal-body').addClass("wrapper wrapper-content gray-bg");

        modal2.setTitle(procedure_name + ' Step Detail');

        var el = '<div class="row">' +
            '<div class="col-lg-4">' +
            '<div class="ibox float-e-margins">' +
            '<div class="ibox-title">' +
            '<h5>' +
            '<span id="info-modal">Create Step</span>' +
            '<small id="info-name-modal"></small>' +
            '</h5>' +
            '</div>' +
            '<div class="ibox-content">' +
            '<div class="row">' +
            '<div class="col-sm-12">' +
            '<form id="form" role="form">' +
            '<div class="form-group">' +
            '<label>Name</label>' +
            '<input id="name-modal" type="text" placeholder="" class="form-control">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Description</label>' +
            '<input id="description-modal" type="text" placeholder="" class="form-control">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Duration</label>' +
            '<input id="duration-modal" type="number" min="1" class="form-control">' +
            '</div>' +
            '<div class="pull-right">' +
            '<button id="reset-modal" type="button" class="btn btn-sm btn-default m-t-n-xs">' +
            '<strong>Reset</strong>' +
            '</button>' +
            '<button id="save-modal" type="button" class="btn btn-sm btn-success m-t-n-xs">' +
            '<strong>Save</strong>' +
            '</button>' +
            '</div>' +
            '</form>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="col-lg-8">' +
            '<div class="ibox float-e-margins">' +
            '<div class="ibox-title">' +
            '<h5>Current Steps </h5>' +
            '</div>' +
            '<div class="ibox-content">' +
            '<div id="table-modal" class="table-responsive">Loading data..' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        modal2.setBody(el).show();

        setTimeout(function () {
            $.ajax({
                method: "GET",
                url: '!/getsteps?procedure_id=' + procedure_id,
                success: function (data, status, xhr) {
                    console.log(data);
                    var tableModalContainer = $(modalselector + ' .table-responsive');
                    saveModal = $(modalselector + ' #save-modal');
                    resetModal = $(modalselector + ' #reset-modal');
                    nameModal = $('#name-modal');
                    descriptionModal = $('#description-modal');
                    durationModal = $('#duration-modal');
                    if (typeof tableModalContainer.find('table')[0] !== "undefined") {
                        // safe to use the function
                        tableModalContainer.find('table').destroy();
                    }
                    tableModalContainer.html('<table class="table table-striped table-bordered table-hover">' +
                        '<thead>' +
                        '<tr>' +
                        '<th>Delete</th>' +
                        '<th>Step No</th>' +
                        '<th>Name</th>' +
                        '<th>Description</th>' +
                        '<th>Duration (hour)</th>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody></tbody>' +
                        '</table>');

                    saveModal.off('click');
                    resetModal.off('click');
                    saveModal.on('click', savingModal);
                    resetModal.on('click', function () {
                        isUpdateModal = false;
                        $('#info-modal').text("Create");
                        $('#info-name-modal').text("");
                        $('#name-modal').val("");
                        $('#description-modal').val("");
                        $('#duration-modal').val(1);
                    });
                    var rows = data.data;
                    if (rows.length > 0) {
                        lastStepNumber = rows[rows.length - 1].stepNumber;
                    }
                    var cnt = 1;
                    var tbody = tableModalContainer.find('tbody');
                    rows.forEach(function (row) {
                        var tr = $('<tr>');
                        var action = $('<td>');

                        var actionBtn = $("<button type='button' class='btn btn-xs btn-danger rm-step-btn'><i class='fa fa-times'></i></button>");

                        row.notes = row.notes || "";
                        action.append(actionBtn);

                        //
                        tr.data(row);
                        tr.append(action);
                        tr.append("<td>" + cnt + "</td>")
                        tr.append("<td>" + row.name + "</td>")
                        tr.append("<td>" + row.description + "</td>")
                        tr.append("<td>" + row.duration + "</td>")

                        tr.on("click", function (ev) {
                            var is = ev.target.nodeName;
                            var data = $(this).data();
                            if (["INPUT", "BUTTON", "I"].indexOf(is) == -1) {
                                $('#info-modal').text("Update ");
                                modal3.setTitle("Update : " + data.name);
                                $('#info-name-modal').text("\"" + data.name + "\"");
                                $('#name-modal').val(data.name);
                                $('#description-modal').val(data.description);
                                $('#duration-modal').val(data.duration);

                                isUpdateModal = data._id;
                            }
                        });
                        actionBtn.stepid = row._id;
                        actionBtn.on("click", function () {
                            modal3
                            .setTitle("Delete : " + $(this).data('name'))
                            .setBody("Are you sure want to remove this step?")
                            .show();
                            modal3.$buttons.OK.off("click");
                            modal3.$buttons.OK.on("click", function () {
                                modal3.hide();
                                deleteStep(actionBtn.stepid);

                            });
                        })

                        tbody.append(tr)
                        cnt++;
                    })

                    tableModalContainer.find('table').DataTable({
                        pageLength: 5,
                        lengthMenu: [5, 10, 25, 50, 75, 100],
                        order: [[1, "asc"]],
                        responsive: false,
                        buttons: []
                    });
                },
                error: function (xhr, status, err) {
                    twowew({
                        type: "error",
                        title: "GET",
                        message: xhr.responseJSON.message,
                        time: 0
                    });
                }
            });
        }, 50)
    }

    var gettingCategory = function () {
        $.ajax({
            method: "GET",
            dataType: "json",
            async: false,
            url: "!/categories?" + $.param({limit: 1000})
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
                var rows = res.data.rows;
                rows.forEach(function (row) {
                    category.append('<option value="' + row._id + '">' + row.name + '</option>');
                });
            }
            category.chosen({no_results_text: "Oops, nothing found!", width: "100%"});
        });
    };
    var gettingRoles = function () {
        $.ajax({
            method: "GET",
            dataType: "json",
            async: false,
            url: "!/roles?" + $.param({limit: 1000})
        }).error(function (jqXHR, is, message) {
            twowew({
                type: "error",
                title: "GET",
                message: jqXHR.responseJSON.message,
                time: 0
            });
            console.error("GET", jqXHR.responseJSON);
        }).success(function (res) {
            console.log(res)
            if (res.data.total) {
                var rows = res.data.rows;
                rows.forEach(function (row) {
                    role.append('<option value="' + row._id + '">' + row.name + '</option>');
                });
            }
            role.chosen({no_results_text: "Oops, nothing found!", width: "100%"});
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
                    var action = $('<td>');
                    var detail = $('<td>');
                    var actionBtn = $("<button type='button' class='btn btn-xs btn-danger'><i class='fa fa-times'></i></button>");
                    var detailBtn = $("<button type='button' class='btn btn-xs btn-primary'>show</button>");
                    row.notes = row.notes || "";
                    action.append(actionBtn);
                    detail.append(detailBtn);
                    //
                    tr.data(row);
                    tr.append(action);
                    tr.append("<td>" + row.name + "</td>")
                    tr.append("<td>" + row.description + "</td>")
                    tr.append("<td>" + row.categories.name + "</td>")
                    tr.append("<td>" + row.roles.name + "</td>");
                    tr.append(detail);
                    tr.on("click", function (ev) {
                        var is = ev.target.nodeName;
                        var data = $(this).data();
                        if (["INPUT", "BUTTON", "I"].indexOf(is) == -1) {
                            info.text("Update");
                            modal.setTitle("Update : " + data.name);
                            infoname.text("\"" + data.name + "\"");
                            name.val(data.name);
                            description.val(data.description);
                            role.val(data.roles._id).trigger("chosen:updated");
                            category.val(data.categories._id).trigger("chosen:updated");
                            notes.val(data.notes);
                            isUpdate = data._id;
                        }
                    });
                    actionBtn.data({
                        id: row._id,
                        name: row.name
                    });
                    actionBtn.on("click", function () {
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
                    detailBtn.procId = row._id;
                    detailBtn.procName = row.name;
                    detailBtn.on('click', function () {
                        console.log(detailBtn.procId);
                        procedure_id = detailBtn.procId;
                        procedure_name = detailBtn.procName;
                        getSteps();
                    });
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
            "roles._id": role.val(),
            "categories._id": category.val(),
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
        console.log(data);
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

    var savingModal = function () {
        var method = "POST";
        var url_ = "!/steps/";

        if (isUpdateModal) {
            var _data = {
                "name": nameModal.val(),
                "description": descriptionModal.val(),
                "duration": parseInt(durationModal.val())
            };

            method = "PUT";
            url_ = url_ + isUpdateModal;
            var data = {
                docs: _data
            };
        } else {
            var data = {
                name: nameModal.val(),
                description: descriptionModal.val(),
                notes: "",
                "procedures._id": procedure_id,
                duration: parseInt(durationModal.val()),
                stepNumber: lastStepNumber + 1,
            };
        }
        console.log(data);

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
                resetModal.click();
                getSteps();
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

        if (method == "PUT") {
            modal3.setTitle('Prompt');
            modal3.setBody("Are you sure want to save these changes?").show();
            modal3.$buttons.OK.off("click");
            modal3.$buttons.OK.on("click", function () {
                $('#save-modal').addClass('disabled');
                $('#save-modal').html('saving..');
                modal3.hide();
                save();
            });
        } else {
            save();
        }
    }

    var deleteStep = function (_id) {
        $.ajax({
            method: 'delete',
            url: '!/steps/' + _id,
            success: function (data, status, xhr) {
                getSteps();
                twowew({
                    type: status == "success" ? "success" : "error",
                    title: "Delete Step",
                    message: "success" || xhr.responseJSON.message,
                    time: toastmsg ? 0 : 3000
                });
                toastmsg = false;
            },
            error: function (xhr, status, err) {
                toastmsg = xhr.responseJSON.message;
            }
        })
    }
    //
    init();
})
