var factory = 7;
var home = __dirname + "/";
var data = {
    groups : [
        {
            "name": "Root",
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        },
        {
            "name": "Public",
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        },
        {
            "name": "Super Admin",
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
            "name": "Admin",
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        },
        {
            "name": "Implementor",
            "routes" : [],
            "restricted" : true,
            "notes" : "",
            "createdAt" : new Date(),
            "active" : true
        }
    ],
    organization : {
        "name": "Developer",
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
    users : [
        {
            "username": "root",
            "password": "root" + Math.floor(Math.random() * 10000),
            "organizations._id": null,
            "groups._id": null,
            "phone": {
                "value": "62899100000"
            },
            "email": {
                "value": "developer.root@lensa.com"
            },
            "gender": "male",
            "name": {
                "first": "Dev",
                "last": "Root"
            },
            "restricted" : true
        },
        {
            "username": "superadmin",
            "password": "superadmin" + Math.floor(Math.random() * 10000),
            "organizations._id": null,
            "groups._id": null,
            "phone": {
                "value": "62899100001"
            },
            "email": {
                "value": "developer.superadmin@lensa.com"
            },
            "gender": "male",
            "name": {
                "first": "Dev",
                "last": "Super Admin"
            }
        },
        {
            "username": "moderator",
            "password": "moderator" + Math.floor(Math.random() * 10000),
            "organizations._id": null,
            "groups._id": null,
            "phone": {
                "value": "62899100002"
            },
            "email": {
                "value": "developer.moderator@lensa.com"
            },
            "gender": "male",
            "name": {
                "first": "Dev",
                "last": "Moderator"
            }
        },
        {
            "username": "admin",
            "password": "admin" + Math.floor(Math.random() * 10000),
            "organizations._id": null,
            "groups._id": null,
            "phone": {
                "value": "62899100003"
            },
            "email": {
                "value": "developer.admin@lensa.com"
            },
            "gender": "male",
            "name": {
                "first": "Dev",
                "last": "Admin"
            }
        },
        {
            "username": "implementor",
            "password": "implementor" + Math.floor(Math.random() * 10000),
            "organizations._id": null,
            "groups._id": null,
            "phone": {
                "value": "62899100004"
            },
            "email": {
                "value": "developer.implementor@lensa.com"
            },
            "gender": "male",
            "name": {
                "first": "Dev",
                "last": "Implementor"
            }
        },
        {
            "username": "public",
            "password": "public" + Math.floor(Math.random() * 10000),
            "organizations._id": null,
            "groups._id": null,
            "phone": {
                "value": "62899100005"
            },
            "email": {
                "value": "developer.public@lensa.com"
            },
            "gender": "male",
            "name": {
                "first": "Dev",
                "last": "Public"
            }
        }
    ]
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
            var organization = new Collection["organizations"](data.organization);
            organization.save().then(function (docs) {
                var row2 = mongoose.normalize(docs);
                data.users.forEach(function(d, i){
                    d["groups._id"] = rows1.filter(function(el){
                        return el.name.toLowerCase().replace(/\s/g, "") == d.username
                    })[0]._id;
                    d["organizations._id"] = row2._id;
                    //
                    var user = new Collection["users"](d);
                    user.save().then(function (docs) {
                        if (i == data.users.length -1 ) {
                            console.log('   >> You can login with this account..');
                            data.users.forEach(function (d) {
                                console.log('      Username : ' + d.username);
                                console.log('      Password : ' + d.password);
                                console.log('      ---------------------------');
                            });
                            setTimeout(function(){
                                process.exit(1);
                            }, 5000)
                        }
                    }).catch(function (e) {
                        console.log(e);
                        process.exit(1);
                    });
                })
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