module.exports = function (i) {
    var ip = [];
    var i = i || 0;
    var ifaces = require('os').networkInterfaces();
    for (var k in ifaces) {
        if (ifaces.hasOwnProperty(k)) {
            var addrs = ifaces[k];
            addrs.forEach(function (addr) {
                if (addr.family == 'IPv4' && addr.internal === false) {
                    ip.indexOf(addr.address) === -1 ? ip.push(addr.address) : null;
                }
            });
        }
    }
    return ip[i];
};