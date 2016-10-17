var factory = 7;
var domain = "localhost";
//
module.exports.run = function (worker) {
    var global = (function () {
        var opts = worker.options;
        var home = opts.paths.appDirPath + '/';
        var obj = {
            factory : factory,
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
            sessionAge : opts.sessionAge,
            regEx : {
                //email : /[a-z0-9]+[_a-z0-9\.-]*[a-z0-9]+@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})/i,
                email : /^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/i,
                phone : /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/i,
                username : /^[a-zA-Z0-9]*$/i,
                password : /[a-zA-Z0-9\_\~\!\@\#\$\%\^\&\*\(\)\_\+\`\-\=\[\]\\\{\}\|\;\'\:\"\,\.\/\<\>\?]+/i,
                zipcode : /(^\d{5}([\-]?\d{4})?$)|(^(GIR|[A-Z]\d[A-Z\d]??|[A-Z]{2}\d[A-Z\d]??)[ ]??(\d[A-Z]{2})$)|(\b((?:0[1-46-9]\d{3})|(?:[1-357-9]\d{4})|(?:[4][0-24-9]\d{3})|(?:[6][013-9]\d{3}))\b)|(^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])\ {0,1}(\d[ABCEGHJKLMNPRSTVWXYZ]\d)$)|(^(F-)?((2[A|B])|[0-9]{2})[0-9]{3}$)|(^(V-|I-)?[0-9]{5}$)|(^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$)|(^[1-9][0-9]{3}\s?([a-zA-Z]{2})?$)|(^([1-9]{2}|[0-9][1-9]|[1-9][0-9])[0-9]{3}$)|(^([D-d][K-k])?( |-)?[1-9]{1}[0-9]{3}$)|(^(s-|S-){0,1}[0-9]{3}\s?[0-9]{2}$)|(^[1-9]{1}[0-9]{3}$)|(^\d{6}$)/i
            }
        };
        //
        try {
            obj.ip = require(obj.libs + 'getip')()
        } catch (e) {
            obj.ip = domain;
        }
        obj.getCode4 = require(obj.libs + 'code4');
        obj.account = {
            domain : domain + (obj.port !== "80" ? ":" + obj.port : ""),
            mail : require(obj.config + 'mail'),
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