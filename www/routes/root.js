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
            model.count({active : true}).lean().catch(function (e) {
                next(e)
            }).then(function (length) {
                model.find({active : true})
                .sort({[sortBy] : direction}).skip(skip).limit(limit)
                .populate(popQuery).lean().then(function (docs) {
                    var rows = mongoose.normalize(docs);
                    res.send({
                        status : 200,
                        message : httpCode[200],
                        error : null,
                        data : {
                            pop : popQuery,
                            limit : limit,
                            page : page,
                            sort : {[sortBy] : direction},
                            total : length,
                            rows : rows
                        }
                    })
                })
                .catch(function (e) {
                    next(e)
                })
            })
        } else next(req.params);
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
            model.findOne({_id : id, active : true}).populate(popQuery).lean().then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send({
                    status : 200,
                    message : httpCode[200],
                    error : null,
                    data : rows
                })
            })
            .catch(function (e) {
                next(e)
            })
        } else next(req.params);
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
                    status : 200,
                    message : httpCode[200],
                    error : null,
                    data : rows
                })
            }).catch(function (e) {
                next(e)
            });
        } else next(req.params);
    });
    api.put('/:collection/:id', function (req, res, next) {
        var notError = true;
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        //Validation block : start.
        if (Collection.hasOwnProperty(collname) && id) {
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
        } else notError = "req.params|String";
        //Validation block : end.
        //
        if (notError == true) {
            var model = Collection[collname];
            var selection = {_id : id, active : true};
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
            } else delete docs["active"];
            //
            model.update(selection, {$set : docs}, {runValidators : true}).then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send({
                    status : 200,
                    message : httpCode[200],
                    error : null,
                    data : rows
                })
            }).catch(function (e) {
                next(e)
            });
        } else {
            var errs = notError.split("|");
            var what = {
                require : errs[0],
                type : errs[1],
                founded : eval(errs[0])
            };
            next({errors : what})
        }
    });
    api.delete('/:collection/:id', function (req, res, next) {
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        if (Collection.hasOwnProperty(collname) && id) {
            var model = Collection[collname];
            model.update(
                {_id : id, active : true, restricted : false},
                {$set : {active : false}}
            ).then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send({
                    status : 200,
                    message : httpCode[200],
                    error : null,
                    data : rows
                })
            }).catch(function (e) {
                next(e)
            });
        } else next(req.params);
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
            name : global.name,
            description : global.description,
            version : global.version,
            models : (function () {
                var o = {}
                for (var m in Collection) o[Collection[m].collection.name] = m;
                return o
            })()
        };
        res.render(namescape, locals.www);
    });
    return page;
};