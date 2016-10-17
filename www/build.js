var factory = 7;
var home = __dirname + "/";
var master = {
    group : {
        name : "Root"
    },
    organization : {
        name : "Developer"
    },
    user : {
        username : "root",
        password : "passwd" + Math.floor(Math.random() * 10000)
    }
};
var masterGroup = "Root";
var data = {
    groups : [
        {
            "name": master.group.name,
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        },
        {
            "name": "Super Administrator",
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        },
        {
            "name": "Moderator",
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        },
        {
            "name": "Administrator",
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        },
        {
            "name": "Pelaksana",
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        }
    ],
    organization : {
        "name": master.organization.name,
        "pic": "Lensa Corp",
        "location": {
            "address": "Jl. Sejauh Mata Memandang",
            "state": "Jawa Barat",
            "zipcode": "40132",
            "country": "Indonesia",
            "administrativeAreaLevel": 2,
            "administrativeName": "Bandung",
            "lat": "-6.8850527",
            "long": "107.6177385"
        },
        "phone": {
            "value": "62899100000"
        },
        "email": {
            "value": "developer@lensa.com"
        },
        "restricted" : true
    },
    user : {
        "username": master.user.username,
        "password": master.user.password,
        "organizations._id": null,
        "groups._id": null,
        "phone": {
            "value": "62899100000"
        },
        "email": {
            "value": "developer@lensa.com"
        },
        "gender": "male",
        "name": {
            "first": "Im",
            "last": "Root"
        },
        "restricted" : true
    }
};
var global = (function () {
    var obj = {
        factory : factory,
        home : home,
        libs : home + 'libs/',
        models : home + 'models/',
        config : home + 'config/',
        routes : home + 'routes/',
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
    obj.getCode4 = require(obj.libs + 'code4');
    obj.account = {
        mongo : require(obj.config + 'mongo')
    };
    return obj
})();
//
var mongodb = global.account.mongo;
var mongoose = require(global.libs + 'mongoose');
var main = function (db) {
    var account = global.account;
    var config = global.config;
    var mongoose = db.mongoose;
    var models = require(global.models)(mongoose, {
        directory : global.models,
        getCode4 : global.getCode4,
        factory : global.factory,
        regEx : global.regEx
    });
    var Collection = (function () {
        var o = {};
        for (var m in models) o[models[m].collection.name] = mongoose.models[m];
        return o;
    })();
    //
    var groups = Collection["groups"];
    groups.collection.insert(data.groups, function(e1, res1){
        if (e1) {
            console.log(e1);
            process.exit(1);
        } else {
            var rows1 = mongoose.normalize(res1.ops);
            data.user["groups._id"] = rows1.filter(function(el){
                return el.name == master.group.name
            })[0]._id;
            var organization = new Collection["organizations"](data.organization);
            organization.save().then(function (docs) {
                var row2 = mongoose.normalize(docs);
                data.user["organizations._id"] = row2._id;
                var user = new Collection["users"](data.user);
                console.log(data.user)
                user.save().then(function (docs) {
                    var row3 = mongoose.normalize(docs);
                    console.log('   >> You can login with this account..');
                    console.log('      Username : ' + data.user.username);
                    console.log('      Password : ' + data.user.password);
                    process.exit(1);
                }).catch(function (e) {
                    console.log(e);
                    process.exit(1);
                });
            }).catch(function (e) {
                console.log(e);
                process.exit(1);
            });
        }
    })
};
mongodb.database.onListen = function (err, db) {
    if (!err) {
        console.log('   >> ' + process.pid + ' Connected to mongodb');
        main(db);
    } else console.log('> Error open connection', err)
};
var Db = require(global.libs + 'db');
new Db(mongoose, mongodb.connection).open(mongodb.database);