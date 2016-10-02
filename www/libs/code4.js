var code4 = function () {
    var d = new Date();
    var ms = Math.round(d.getMilliseconds() / 10).toString();
    return code4.shuffle([
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
        ms.length == 3 ? "99" : ms
    ].map(function (t) {
        t = t.toString();
        if (t.length == 1) return 0 + t;
        return t
    })).join("").match(/.{1,4}/g).map(function (t) {
        var r = 0;
        for (var n in t) r += parseInt(t[n]);
        return r.toString(36)
    }).join("");
};
code4.shuffle = function (a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
};
module.exports = code4;