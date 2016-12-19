var namescape = "root";
var page = require('express').Router();
var api = require('express').Router();
var httpCode = require('http').STATUS_CODES;
//
module.exports = function (args, app) {
    var global = args.global;
    var locals = args.locals;
    var worker = args.worker;
    var account = args.account;
    var mongoose = args.mongoose;
    var maxLimit = 50;
    var Collection = (function () {
        var o = {};
        var models = mongoose.models;
        for (var m in models) o[models[m].collection.name] = mongoose.models[m];
        return o;
    })();
    var errfunc = function (res, e) {
        console.log(e);
        var body = {
            "status": 0,
            "message": e,
        };
        res.status(500).send(body);
    }

    var successfunc = function (res, data) {
        var body = {
            "status": 1,
            "data": data,
        };
        res.status(200).send(body);
    }
    //
    api.get('/:collection/', function (req, res, next) {
        var collname = (req.params.collection || "").toLowerCase();
        var limit = Number(req.query.limit) || maxLimit;
        var page = Number(req.query.page) || 1;
        var pop = Number(req.query.pop) || 0;
        var sortBy = req.query.sort || "name";
        var direction = Number(req.query.direction) || 1;
        var skip = (page - 1) * limit;
        //
        limit = limit > maxLimit ? maxLimit : limit;
        if (Collection.hasOwnProperty(collname)) {
            var model = Collection[collname];
            var popQuery = "";
            if (model.getPopQuery) {
                popQuery = model.getPopQuery(pop);
                if (!Object.keys(popQuery).length) popQuery = "";
            }
            model.count({active: true}).lean().catch(function (e) {
                next(e)
            }).then(function (length) {
                model.find({active: true})
                .sort({[sortBy]: direction}).skip(skip).limit(limit)
                .populate(popQuery).lean().then(function (docs) {
                    var rows = mongoose.normalize(docs);
                    res.send({
                        status: 200,
                        message: httpCode[200],
                        error: null,
                        data: {
                            pop: popQuery,
                            limit: limit,
                            page: page,
                            sort: {[sortBy]: direction},
                            total: length,
                            rows: rows
                        }
                    })
                })
                .catch(function (e) {
                    next(e)
                })
            })
        } else {

            //custom APIs
            switch (collname) {
                case 'getorganization':
                    var Organization = Collection['organizations'];
                    Organization.find().then(function (docs) {
                        successfunc(res, docs);
                    })
                    .catch(function (e) {
                        errfunc(res, e);
                    });
                    break;
                default:
                    var error = ("collname|String").split("|");
                    var Err = new Error([httpCode[404], collname].join(" : "))
                    Err.errors = {
                        require: error[0],
                        type: error[1],
                        founded: eval(error[0])
                    }
                    next(Err);
                    break;
            }
        }
        ;
    });
    api.get('/:collection/:id', function (req, res, next) {
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        var pop = Number(req.query.pop) || 0;
        if (Collection.hasOwnProperty(collname)) {
            var model = Collection[collname];
            var popQuery = "";
            if (model.getPopQuery) {
                popQuery = model.getPopQuery(pop);
                if (!Object.keys(popQuery).length) popQuery = "";
            }
            model.findOne({_id: id, active: true}).populate(popQuery).lean().then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send({
                    status: 200,
                    message: httpCode[200],
                    error: null,
                    data: rows
                })
            })
            .catch(function (e) {
                next(e)
            })
        } else {
            //custom APIs
            switch (collname) {
                case 'insertorganization':
                    var Organization = Collection['organizations'];
                    var orgObj = {
                        name: req.body.name,
                        pic: req.body.pic,
                        "email.value": req.body.email,
                        "phone.value": req.body.phone,
                        "location.address": req.body.address,
                        "location.country": req.body.country,
                        "location.state": req.body.state,
                        "location.zipcode": req.body.zipcode,
                        "location.administrativeAreaLevel": req.body.level,
                        "location.lat": req.body.lat,
                        "location.long": req.body.long
                    };
                    if (req.body.avatar) orgObj.media._id = req.body.avatar;
                    var newOrganization = new Organization(orgObj);
                    newOrganization.save()
                    .then(function (result) {
                        successfunc(res, result);
                    })
                    .catch(function (e) {
                        errfunc(res, e);
                    });
                    break;
                default:
                    var error = ("collname|String").split("|");
                    var Err = new Error([httpCode[404], collname].join(" : "))
                    Err.errors = {
                        require: error[0],
                        type: error[1],
                        founded: eval(error[0])
                    }
                    next(Err);
                    break;
            }
        }
        ;
    });
    api.post('/:collection', function (req, res, next) {
        //todo : auto gen phone verify code & email verify url if insert new user;
        var collname = (req.params.collection || "").toLowerCase();
        if (Collection.hasOwnProperty(collname)) {
            var model = Collection[collname];
            var data = new model(req.body);
            data.save().then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send({
                    status: 200,
                    message: httpCode[200],
                    error: null,
                    data: rows
                })
            }).catch(function (e) {
                next(e)
            });
        } else {
            var error = ("req.params|String").split("|");
            var Err = new Error([httpCode[404], id].join(" : "))
            Err.errors = {
                require: error[0],
                type: error[1],
                founded: eval(error[0])
            }
            next(Err);
        }
        ;
    });
    api.put('/:collection/:id', function (req, res, next) {
        var err, notError = true;
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        var model = Collection[collname];
        var isAllow = function (callback) {
            model.findOne({_id: id, active: true})
            .lean().then(function (docs) {
                var row = mongoose.normalize(docs);
                var code = null;
                //
                if (docs && docs.restricted) code = 403;
                if (!docs) code = 404;
                if (!code) {
                    callback(row)
                } else {
                    var error = ("req.params|String").split("|");
                    var Err = new Error([httpCode[code], id].join(" : "))
                    Err.errors = {
                        require: error[0],
                        type: error[1],
                        founded: eval(error[0])
                    }
                    next(Err);
                }
            })
            .catch(function (e) {
                next(e)
            });
        };
        if (Collection.hasOwnProperty(collname) && id) {
            isAllow(function (row) {
                //Validation block : start.
                var body = req.body;
                if (body && req.hasOwnProperty("body")) {
                    if (body.constructor !== Object) notError = "body|Object";
                    else {
                        if (body.docs && body.hasOwnProperty("docs")) {
                            if (body.docs.constructor !== Object) notError = "body.docs|Object";
                        } else notError = "body.docs|Object";
                        //
                        if (body.hasOwnProperty("nested")) {
                            var nested = body.nested;
                            if (nested.constructor !== Object) notError = "body.nested|Object";
                            else {
                                if (nested.key && nested.hasOwnProperty("key")) {
                                    if (nested.key.constructor !== String) notError = "nested.key|String";
                                    if (nested.value && nested.hasOwnProperty("value")) {
                                        if (nested.value.constructor !== String) notError = "nested.value|String";
                                    } else notError = "nested.value|String";
                                } else notError = "nested.key|String";
                            }
                        }
                    }
                } else notError = "body|Object";
                //Validation block : end.
                //
                if (notError == true) {
                    var selection = {_id: id, active: true, restricted: false};
                    var docs = req.body.docs;
                    var nested = req.body.nested;
                    if (nested) {
                        selection[nested.key] = nested.value;
                        var partial = {};
                        for (var key in docs) {
                            if (key !== "active") {
                                var parent = nested.key.substr(0, nested.key.lastIndexOf("."));
                                var selected = [parent, key].join('.$.');
                                partial[selected] = docs[key];
                            }
                        }
                        docs = partial;
                    } else {
                        delete docs["active"];
                        delete docs["restricted"];
                    }
                    //
                    model.update(selection, {$set: docs}, {runValidators: true}).then(function (docs) {
                        var rows = mongoose.normalize(docs);
                        res.send({
                            status: 200,
                            message: httpCode[200],
                            error: null,
                            data: rows
                        })
                    }).catch(function (e) {
                        next(e)
                    });
                } else {
                    var error = notError.split("|");
                    var Err = new Error([httpCode[400], id].join(" : "))
                    Err.errors = {
                        require: error[0],
                        type: error[1],
                        founded: eval(error[0])
                    }
                    next(Err);
                }
            });
        } else {
            var error = ("req.params|String").split("|");
            var Err = new Error([httpCode[404], id].join(" : "))
            Err.errors = {
                require: error[0],
                type: error[1],
                founded: eval(error[0])
            }
            next(Err);
        }
    });
    api.delete('/:collection/:id', function (req, res, next) {
        var err = undefined;
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        var model = Collection[collname];
        var isAllow = function (callback) {
            model.findOne({_id: id, active: true})
            .lean().then(function (docs) {
                var row = mongoose.normalize(docs);
                var code = null;
                //
                if (docs && docs.restricted) code = 403;
                if (!docs) code = 404;
                if (!code) {
                    callback(row)
                } else {
                    var error = ("req.params|String").split("|");
                    var Err = new Error([httpCode[code], id].join(" : "))
                    Err.errors = {
                        require: error[0],
                        type: error[1],
                        founded: eval(error[0])
                    }
                    next(Err);
                }
            })
            .catch(function (e) {
                next(e)
            });
        };
        if (Collection.hasOwnProperty(collname) && id) {
            isAllow(function (row) {
                model.update(
                    {_id: id, active: true, restricted: false},
                    {$set: {active: false}}
                ).then(function (docs) {
                    var rows = mongoose.normalize(docs);
                    res.send({
                        status: 200,
                        message: httpCode[200],
                        error: null,
                        data: rows
                    })
                }).catch(function (e) {
                    next(e)
                });
            });
        } else {
            var error = ("req.params|String").split("|");
            var Err = new Error([httpCode[404], id].join(" : "))
            Err.errors = {
                require: error[0],
                type: error[1],
                founded: eval(error[0])
            }
            next(Err);
        }
        ;
    });
    //
    page.use(function (req, res, next) {
        var group = req.logged.user.groups.name.toLowerCase().replace(/\s/g, "");
        if (group !== namescape) next(group)
        else next();
    });
    page.use('/!', api);
    page.get('/', function (req, res, next) {
        locals.www = {
            name: global.name,
            description: global.description,
            version: global.version,
            models: (function () {
                var o = {}
                for (var m in Collection) o[Collection[m].collection.name] = m;
                return o
            })()
        };
        res.render(namescape, locals.www);
    });
    return page;
};