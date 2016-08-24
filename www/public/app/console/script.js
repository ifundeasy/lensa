$(function () {
    var Fn = function () {
        var p = $('#restify');
        var $$ = function (selector) {
            return p.find(selector);
        };
        var el = {
            container : p,
            header : $$('#tab_header'),
            query : $$('#tab_query'),
            payload : $$('#tab_payload'),
            response : $$('#response'),
            url : $$('#url'),
            method : $$('#method'),
            others : $$('.tooltips')
        };
        el.others.tooltip('destroy').tooltip({
            placement : 'bottom'
        });
        el.container.find('.tools a.hide-portlet').on('click', function () {
            $('body').css('overflow-y', 'auto');
            el.container.hide()
        });
        //
        this.p = p;
        this.el = el;
        this.$$ = $$;
    };
    Fn.prototype.htmlRequestRow = function (key, val) {
        return $(
            '<div class="row p-b-5">' +
            '<div class="col-lg-12 p-h-10">' +
            '<div class="col-lg-4 p-3">' +
            '<input type="text" class="form-control input-sm" readonly value="' + key + '">' +
            '</div>' +
            '<div class="col-lg-8 p-3">' +
            '<input type="text" class="form-control input-sm each-value" data-key="' + key + '" placeholder="' + val + '">' +
            '</div>' +
            '</div>' +
            '</div>'
        );
    };
    Fn.prototype.send = function () {
        var me = this;
        var el = me.el;
        var geting = function (tabpane) {
            var o = {};
            tabpane.find('input.each-value').each(function (i, e) {
                o[$(this).attr('data-key')] = $(this).val();
            });
            return Object.keys(o).length ? o : null;
        };
        var url = el.url.data('.');
        var method = el.method.data('.');
        var obj = {
            header : geting(el.header),
            query : geting(el.query),
            payload : geting(el.payload)
        };
        for (var o in obj) if (!Object.keys(obj[o] || {}).length) delete obj[o];
        console.info('>> /' + method, url, obj);
    };
    Fn.prototype.init = function (data) {
        var me = this;
        var $$ = me.$$;
        var el = me.el;
        var headers = data.req.headers || {},
            queries = data.req.queries || {},
            payloads = data.req.payloads || {},
            params = Object.keys(data.req.params || {}) || [];
        //
        var getTab = function (id) {
            return $$('ul.nav.nav-tabs>li>a[href="#' + id + '"]');
        };
        el.header.html('');
        el.query.html('');
        el.payload.html('');
        el.method.data('.', data.method.toUpperCase());
        el.method.text(data.method.toUpperCase());
        el.url.val([data.url].concat(params).join('/'));
        el.url.data('.', [data.url].concat(params).join('/'));
        //
        if (Object.keys(headers).length) {
            getTab(el.header.attr('id')).show();
            for (var h in headers) {
                var header = headers[h];
                el.header.append(me.htmlRequestRow(h, header));
            }
        } else getTab(el.header.attr('id')).hide();
        if (Object.keys(queries).length) {
            getTab(el.query.attr('id')).show();
            for (var q in queries) {
                var query = queries[q];
                el.query.append(me.htmlRequestRow(q, query));
            }
        } else getTab(el.query.attr('id')).hide();
        if (Object.keys(payloads).length) {
            getTab(el.payload.attr('id')).show();
            for (var p in payloads) {
                var payload = payloads[p];
                el.payload.append(me.htmlRequestRow(p, payload));
            }
        } else getTab(el.payload.attr('id')).hide();
        //
        var first = $($$('.tab-pane input')[0]),
            id = first.closest('.tab-pane').attr('id');
        //first.focus();
        getTab(id).click();
        //
        el.container.find('input').keyup(function (e) {
            var code = e.which; // recommended to use e.which, it's normalized across browsers
            if (code == 13) e.preventDefault();
            if (code == 32 || code == 13 || code == 188 || code == 186) {
                me.send();
            }
        });
    };
    App.restify = new Fn();
});