var Modal = function (obj) {
    var me = this;
    me.parent = obj.parent || 'body';
    me.id = obj.id || ("modal-" + (new Date().getTime()).toString(36));
    me.closeable = obj.closeable || false;
    me.backdrop = obj.backdrop;
    me.title = obj.title || me.id;
    me.body = obj.body || "";
    me.handler = obj.handler || {};
    me.already = $("#" + me.id);
    if (me.already.length) me.already.remove();
    return me.init();
}
Modal.prototype.init = function () {
    var me = this;
    me.$parent = $(me.parent);
    me.$container = $('<div id="' + me.id + '" class="modal fade" aria-hidden="true">');
    me.$dialog = $('<div class="modal-dialog">');
    me.$content = $('<div class="modal-content">');
    me.$header = $('<div class="modal-header">');
    me.$title = $('<label class="no-margins"></label>');
    me.$body = $('<div class="modal-body">');
    me.$footer = $('<div class="modal-footer"><div class="pull-right">');
    //
    me.$parent.append(me.$container);
    me.$container.append(me.$dialog);
    me.$dialog.append(me.$content);
    me.$header.append(me.$title);
    me.$content.append(me.$header, me.$body, me.$footer);
    me.$footer = me.$footer.find('div');
    me.$buttons = {};
    //
    if (me.closeable) me.$header.append('<button type="button" class="close" data-dismiss="modal">&times;</button>');
    me.$title.text(me.title);
    me.$body.html(me.body);
    for (var h in me.handler) {
        var config = me.handler[h] || {};
        var button = $('<button class="btn btn-sm m-t-n-xs"><strong></strong></button>');
        button.events = {}
        button.find('strong').text(h);
        if (config.class) button.addClass(config.class);
        if (config.dismiss) button.attr('data-dismiss', "modal");
        me.$footer.append(button);
        me.$buttons[h] = button;
    }
    return me;
}
Modal.prototype.show = function (backdrop) {
    this.$container.modal({backdrop: this.backdrop})
    return this;
};
Modal.prototype.hide = function () {
    this.$container.modal("hide");
    return this;
};
Modal.prototype.destroy = function () {
    this.$container.remove();
    return this;
};
Modal.prototype.setTitle = function (str) {
    this.$title.text(str);
    return this;
};
Modal.prototype.setBody = function (body) {
    this.$body.html(body);
    return this;
};