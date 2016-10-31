var namescape = "superadmin";
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
    var home = global.home;
    //
    var maxLimit = 50;
    var Authorize = require(home + "authorize");
    var Collection = (function () {
        var o = {};
        var models = mongoose.models;
        for (var m in models) o[models[m].collection.name] = mongoose.models[m];
        return o;
    })();
    var authorize = new Authorize({
        models: Collection
    });
    //
    /** **************************************************************************
     ** http data resource
     ** **************************************************************************/
    api.use(function (req, res, next) {
        var pathname = req._parsedUrl.pathname;
        var org = req.logged.user.organizations;
        var orgId = org._id;
        var collname = (pathname.split("/")[1] || "").toLowerCase();
        if (Collection.hasOwnProperty(collname)) {
            var rule = authorize.setRule({
                groups: {
                    "name": {
                        "$nin": ["Root", "Public"]
                    }
                },
                organizations: {
                    "_id": orgId
                },
                posts: {
                    "organizations._id": orgId,
                    "assignTo.users._id": {
                        $exists: false
                    }
                },
                categories: null,
                roles: null,
                procedures: null,
                steps: null,
                users: null
            });
            if (rule.hasOwnProperty(collname)) {
                var model = Collection[collname];
                var popQuery = (function () {
                    if (model.getPopQuery) {
                        var populate = model.getPopQuery(-1);
                        if (!Object.keys(populate).length) return "";
                        return populate;
                    }
                    return "";
                })();
                if (collname == "organizations" || collname == "groups") {
                    req.logged.populate = (function () {
                        var foreign = mongoose.nested(popQuery, -1);
                        if (!Object.keys(foreign).length) return "";
                        return foreign;
                    })();
                    next();
                } else {
                    authorize.setPopulation(popQuery);
                    authorize.init(function (nested) {
                        req.logged.populate = nested;
                        next();
                    }, function (e) {
                        next(e);
                    });
                }
            } else {
                var error = ("collname|String").split("|");
                var Err = new Error([httpCode[403], collname].join(" : "));
                Err.errors = {
                    require: error[0],
                    type: error[1],
                    founded: eval(error[0])
                };
                next(Err);
            }
        } else if (!collname) {
            next();
        } else {
            var error = ("collname|String").split("|");
            var Err = new Error([httpCode[404], collname].join(" : "));
            Err.errors = {
                require: error[0],
                type: error[1],
                founded: eval(error[0])
            };
            next(Err);
        }
    })
    api.all('/', function (req, res) {
        res.send({
            status: 200,
            message: httpCode[200],
            error: null,
            data: req.logged.user
        });
    });
    api.get('/:collection', function (req, res, next) {
        var populate = req.logged.populate;
        var org = req.logged.user.organizations;
        var orgId = org._id
        var collname = (req.params.collection || "").toLowerCase();
        var pop = Number(req.query.pop) || 1;
        var limit = Number(req.query.limit) || maxLimit;
        var page = Number(req.query.page) || 1;
        var sortBy = req.query.sort || "name";
        var direction = Number(req.query.direction) || 1;
        var skip = (page - 1) * limit;
        //
        var model = Collection[collname];
        var query = {
            active: true
        };
        if (collname == "organizations" || collname == "groups") {
            query = authorize.rule[collname];
            model.find(query)
                .populate(populate).lean().then(function (docs) {
                    var rows = mongoose.normalize(docs).filter(function (doc) {
                        if (authorize.isCorrect(doc)) return 1;
                        return 0;
                    });
                    res.send({
                        status: 200,
                        message: httpCode[200],
                        error: null,
                        data: {
                            limit: limit,
                            page: page,
                            sort: {
                                [sortBy]: direction
                            },
                            total: rows.length,
                            rows: rows
                        }
                    })
                })
                .catch(function (e) {
                    next(e);
                });
        } else {
            model.find(query)
                .sort({
                    [sortBy]: direction
                }).skip(skip).limit(limit) //TODO
                .populate(populate).lean().then(function (docs) {
                    var rows = mongoose.normalize(docs).filter(function (doc) {
                        if (authorize.isCorrect(doc)) return 1;
                        return 0;
                    });
                    res.send({
                        status: 200,
                        message: httpCode[200],
                        error: null,
                        data: {
                            limit: limit,
                            page: page,
                            sort: {
                                [sortBy]: direction
                            },
                            total: rows.length,
                            rows: rows
                        }
                    });
                })
                .catch(function (e) {
                    next(e);
                });
        }
    });
    api.get('/:collection/:id', function (req, res, next) {
        var populate = req.logged.populate;
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        var pop = Number(req.query.pop) || 1;
        var model = Collection[collname];
        model.findOne({
                _id: id,
                active: true
            })
            .populate(populate).lean().then(function (docs) {
                var row = mongoose.normalize(docs);
                var is = authorize.isCorrect(row);
                if (is) {
                    res.send({
                        status: 200,
                        message: httpCode[200],
                        error: null,
                        data: row
                    });
                } else {
                    var error = ("req.params|String").split("|");
                    var Err = new Error([httpCode[403], id].join(" : "));
                    Err.errors = {
                        require: error[0],
                        type: error[1],
                        founded: eval(error[0])
                    };
                    next(Err);
                }
            })
            .catch(function (e) {
                next(e);
            });
    });
    api.post('/:collection', function (req, res, next) {
        var collname = (req.params.collection || "").toLowerCase();
        var model = Collection[collname];
        var data = new model(req.body);
        //todo : checking foreign id that given from
        data.save().then(function (docs) {
            var rows = mongoose.normalize(docs);
            res.send({
                status: 200,
                message: httpCode[200],
                error: null,
                data: rows
            });
        }).catch(function (e) {
            next(e);
        });
    });
    api.put('/:collection/:id', function (req, res, next) {
        var notError = true;
        var populate = req.logged.populate;
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        var pop = Number(req.query.pop) || 1;
        var model = Collection[collname];
        var isAllow = function (callback) {
            model.findOne({
                    _id: id,
                    // "$or" : [
                    //     {restricted : {"$exists" : false}},
                    //     {restricted : {"$ne" : true}}
                    // ],
                    restricted: {"$ne" : true},
                    active: true
                })
                .populate(populate).lean().then(function (docs) {
                    var row = mongoose.normalize(docs);
                    var is = authorize.isCorrect(row);
                    var code = null;
                    //
                    if (!docs || !is) code = 404;
                    else if (docs.restricted) code = 403;
                    //
                    if (code) {
                        var error = ("req.params|String").split("|");
                        var Err = new Error([httpCode[code], id].join(" : "));
                        Err.errors = {
                            require: error[0],
                            type: error[1],
                            founded: eval(error[0])
                        };
                        next(Err);
                        return 0;
                    } else {
                        callback(row);
                        return 0;
                    }
                })
                .catch(function (e) {
                    callback(e);
                    return 0;
                });
        };
        if (id) {
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
                if (notError === true) {
                    var selection = {
                        _id: id,
                        active: true
                    };
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
                    model.update(selection, {
                        $set: docs
                    }, {
                        runValidators: true
                    }).then(function (docs) {
                        var rows = mongoose.normalize(docs);
                        res.send({
                            status: 200,
                            message: httpCode[200],
                            error: null,
                            data: rows
                        });
                    }).catch(function (e) {
                        next(e);
                    });
                } else {
                    var error = notError.split("|");
                    var Err = new Error([httpCode[400], id].join(" : "));
                    Err.errors = {
                        require: error[0],
                        type: error[1],
                        founded: eval(error[0])
                    };
                    next(Err);
                }
            });
        } else {
            var error = ("req.params|String").split("|");
            var Err = new Error([httpCode[404], id].join(" : "));
            Err.errors = {
                require: error[0],
                type: error[1],
                founded: eval(error[0])
            };
            next(Err);
        }
    });
    api.delete('/:collection/:id', function (req, res, next) {
        var populate = req.logged.populate;
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        var model = Collection[collname];
        var isAllow = function (callback) {
            model.findOne({
                    _id: id,
                    // "$or" : [
                    //     {restricted : {"$exists" : false}},
                    //     {restricted : {"$ne" : true}}
                    // ],
                    restricted: {"$ne" : true},
                    active: true
                })
                .populate(populate).lean().then(function (docs) {
                    var row = mongoose.normalize(docs);
                    var is = authorize.isCorrect(row);
                    var code = null;
                    //
                    if (!docs || !is) code = 404;
                    else if (docs.restricted) code = 403;
                    //
                    if (code) {
                        var error = ("req.params|String").split("|");
                        var Err = new Error([httpCode[code], id].join(" : "));
                        Err.errors = {
                            require: error[0],
                            type: error[1],
                            founded: eval(error[0])
                        };
                        next(Err);
                        return 0;
                    } else {
                        callback(row);
                        return 0;
                    }
                })
                .catch(function (e) {
                    next(e);
                    return 0;
                });
        };
        if (id) {
            isAllow(function (row) {
                model.update({
                    _id: id,
                    active: true
                }, {
                    $set: {
                        active: false
                    }
                }).then(function (docs) {
                    var rows = mongoose.normalize(docs);
                    res.send({
                        status: 200,
                        message: httpCode[200],
                        error: null,
                        data: rows
                    });
                }).catch(function (e) {
                    next(e);
                });
            });
        } else {
            var error = ("req.params|String").split("|");
            var Err = new Error([httpCode[404], id].join(" : "));
            Err.errors = {
                require: error[0],
                type: error[1],
                founded: eval(error[0])
            };
            next(Err);
        }
    });
    //
    /** **************************************************************************
     ** http data resource register
     ** **************************************************************************/
    page.use(function (req, res, next) {
        var group = req.logged.user.groups.name.toLowerCase().replace(/\s/g, "");
        if (group !== namescape) next(group);
        else next();
    });
    page.use('/!', api);
    page.get('/', function (req, res, next) {
        locals.www = {
            name: global.name,
            description: global.description,
            activePage: req.url, //todo : buat apa lih?
            version: global.version
        };
        res.render(namescape, locals.www);
    });
    return page;
};
