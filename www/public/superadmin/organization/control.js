$(document).ready(function () {
    var url = "!/organizations/";
    var reset = $('#reset');
    var save = $('#save');
    //
    var id = undefined;
    var name = $('#name');
    var pic = $('#pic');
    var address = $('#address');
    var state = $('#state');
    var zipcode = $('#zipcode');
    var country = $('#country');
    var lat = $('#lat');
    var long = $('#long');
    var phone = $('#phone');
    var vphone = $('#vphone');
    var email = $('#email');
    var vemail = $('#vemail');
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
    var init = function () {
        save.on('click', saving);
        reset.on('click', function () {
            isUpdate = false;
            getting();
        });
        getting();
    };
    var getting = function () {
        $.ajax({
            method: "GET",
            dataType: "json",
            url: url
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
                name.val(row.name);
                pic.val(row.pic);
                address.val(row.location.address);
                state.val(row.location.state);
                zipcode.val(row.location.zipcode);
                country.val(row.location.country);
                lat.val(row.location.lat);
                long.val(row.location.long);
                phone.val(row.phone.value);
                email.val(row.email.value);
                notes.val(row.notes);
                if (row.email.verified) {
                    vemail.parent().hide();
                    if (!email.parent().hasClass("col-sm-12")) email.parent().addClass("col-sm-12");
                } else {
                    vemail.parent().show();
                    email.parent().removeClass("col-sm-12");
                }
                if (row.phone.verified) {
                    vphone.parent().hide();
                    if (!phone.parent().hasClass("col-sm-12")) phone.parent().addClass("col-sm-12");
                } else {
                    vphone.parent().show();
                    phone.parent().removeClass("col-sm-12");
                }
            }
        });
    };
    var saving = function () {
        var method = "PUT";
        var data = {
            "name": name.val(),
            "pic": pic.val(),
            "location.address": address.val(),
            "location.state": state.val(),
            "location.zipcode": zipcode.val(),
            "location.country": country.val(),
            "location.lat": lat.val(),
            "location.long": long.val(),
            "phone.value": phone.val(),
            "email.value": email.val(),
            "notes": notes.val()
        };
        $.ajax({
            method: method,
            dataType: "json",
            data: {docs:data},
            url: url + id
        }).error(function (jqXHR, is, message) {
            toastmsg = jqXHR.responseJSON.message;
            console.error(method, jqXHR.responseJSON);
        }).success(function (res) {
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
    //
    init();
});