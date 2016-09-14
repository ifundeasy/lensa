module.exports.run = function (worker) {
    var global = (function () {
        var opts = worker.options;
        var home = opts.paths.appDirPath + '/';
        var obj = {
            node : opts.node,
            home : home,
            libs : home + 'libs/',
            models : home + 'models/',
            config : home + 'config/',
            routes : home + 'routes/',
            name : opts.appName,
            description : opts.description,
            version : opts.version,
            processId : process.pid,
            instanceId : opts.id,
            workerCount : opts.workerCount,
            port : opts.port,
            timeOut : opts.timeOut,
            sessionAge : opts.sessionAge
        };
        //
        try {
            obj.ip = require(obj.libs + 'getip')()
        } catch (e) {
            obj.ip = "localhost";
        }
        obj.account = {
            twitter : require(obj.config + 'twitter'),
            mongo : require(obj.config + 'mongo')
        };
        return obj
    })();
    //
    var mongodb = global.account.mongo;
    var mongoose = require(global.libs + 'mongoose');
    mongodb.database.onListen = function (err, db) {
        if (!err) {
            console.log('   >> ' + process.pid + ' Connected to mongodb');
            require(global.home + 'server')(global, worker, db);
        } else console.log('> Error open connection', err)
    };
    var Db = require(global.libs + 'db');
    new Db(mongoose, mongodb.connection).open(mongodb.database);
};
