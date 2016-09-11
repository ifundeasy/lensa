var Db = function (config) {
    this.url = this.setURL(config);
    return this;
};
Db.prototype.open = function (config) {
    var me = this;
    var url = me.url;
    var o = {
        db : {native_parser : true},
        server : {poolSize : 5},
        promiseLibrary : require('q')
    };
    if (config.name) url += config.name;
    if (config.username) o.user = config.username;
    if (config.password) o.pass = config.password;
    //
    console.log('   >> ' + process.pid + ' Connecting to :', url);
    //
    me.mongoose = require('mongoose');
    me.mongoose.Promise = require('bluebird');
    me.mongoose.connect(url, o, function (err) {
        config.callback(err, me)
    });
};
Db.prototype.setURL = function (config) {
    var s = 'mongodb://';
    if (config.username && config.password) s += [config.username, config.password].join(':') + '@';
    s += [config.host, (config.port || "27017")].join(':');
    s += '/';
    return s
};
module.exports = Db;