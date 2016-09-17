var router = require('express').Router();
var httpCode = require('http').STATUS_CODES;
//
module.exports = function (args) {
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
    router.get('/:collection/', function (req, res, next) {
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
    router.get('/:collection/:id', function (req, res, next) {
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
    router.post('/:collection', function (req, res, next) {
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
    router.put('/:collection/:id', function (req, res, next) {
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        if (Collection.hasOwnProperty(collname) && id) {
            var model = Collection[collname];
            model.update({_id : id}, {$set : req.body}).then(function (docs) {
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
    router.delete('/:collection/:id', function (req, res, next) {
        var collname = (req.params.collection || "").toLowerCase();
        var id = req.params.id;
        if (Collection.hasOwnProperty(collname) && id) {
            var model = Collection[collname];
            model.update({_id : id}, {$set : {active : false}}).then(function (docs) {
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
    return router;
};