$.get('/app/routes|auth|http-signup/data.json', function (o) {
    var $$ = function (selector) {
        return $('#page').find(selector)
    };
    var req = o.request;
    var reqd = o.requestdesc;
    var res = o.response;
    var resd = o.responsedesc;
    var beautify = function (obj) {
        return JSON.stringify(obj, 0, 2)
    };
    $$('#number').text(o.num);
    $$('#title').text(o.name);
    $$('#mode').text(o.mode);
    $$('#description').text(beautify(o.descriptions));
    $$('#method').text(o.method);
    $$('#type').text(o.type);
    $$('#baseapi').text(o.basepath + o.api);
    $$('#url').text(App.host + o.basepath + o.api);
    $$('#version').text(o.version);
    $$('#status').text((o.status || 'available'));
    //
    if (!req.headers || !reqd.headers) {
        $$('#req-headers').text("-");
        $$('#req-headers-ex').remove();
    } else {
        $$('#req-headers').text(req.headers.constructor.name);
        $$('#req-headers-ex').html(beautify(reqd.headers));
    }
    if (!req.params || !reqd.params) {
        $$('#req-params').text("-");
        $$('#req-params-ex').remove();
    } else {
        $$('#req-params').text(req.params.constructor.name);
        $$('#req-params-ex').html(beautify(reqd.params));
    }
    if (!req.queries || !reqd.queries) {
        $$('#req-queries').text("-");
        $$('#req-queries-ex').remove();
    } else {
        $$('#req-queries').text(req.queries.constructor.name);
        $$('#req-queries-ex').html(beautify(reqd.queries));
    }
    if (!req.payloads || !reqd.payloads) {
        $$('#req-payloads').text("-");
        $$('#req-payloads-ex').remove();
    } else {
        $$('#req-payloads').text(req.payloads.constructor.name);
        $$('#req-payloads-ex').html(beautify(reqd.payloads));
    }
    //
    if (!res.success.headers || !resd.success.headers) {
        $$('#res-headers-s').text("-");
        $$('#res-headers-s-ex').remove();
    } else {
        $$('#res-headers-s').text(res.success.headers.constructor.name);
        $$('#res-headers-s-ex').html(beautify(res.success.headers));
    }
    if (!res.success.queries || !resd.success.queries) {
        $$('#res-queries-s').text("-");
        $$('#res-queries-s-ex').remove();
    } else {
        $$('#res-queries-s').text(res.success.queries.constructor.name);
        $$('#res-queries-s-ex').html(beautify(res.success.queries));
    }
    if (!res.success.body || !resd.success.body) {
        $$('#res-body-s').text("-");
        $$('#res-body-s-ex').remove();
    } else {
        $$('#res-body-s').text(res.success.body.constructor.name);
        $$('#res-body-s-ex').html(beautify(res.success.body));
    }
    if (!res.error.headers || !resd.error.headers) {
        $$('#res-headers-e').text("-");
        $$('#res-headers-e-ex').remove();
    } else {
        $$('#res-headers-e').text(res.error.headers.constructor.name);
        $$('#res-headers-e-ex').html(beautify(res.error.headers));
    }
    if (!res.error.queries || !resd.error.queries) {
        $$('#res-queries-e').text("-");
        $$('#res-queries-e-ex').remove();
    } else {
        $$('#res-queries-e').text(res.error.queries.constructor.name);
        $$('#res-queries-e-ex').html(beautify(res.error.queries));
    }
    if (!res.error.body || !resd.error.body) {
        $$('#res-body-e').text("-");
        $$('#res-body-e-ex').remove();
    } else {
        $$('#res-body-e').text(res.error.body.constructor.name);
        $$('#res-body-e-ex').html(beautify(res.error.body));
    }
    $('#console').on('click', function () {
        $('body').css('overflow-y', 'hidden');
        $('#restify').show();
        App.restify.init({
            url : App.host + o.basepath + o.api,
            method : o.method,
            req : req
        });
    });
});