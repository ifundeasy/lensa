var router = require('express').Router();
module.exports = function (args) {
    var global = args.global;
    var locals = args.locals;
    var worker = args.worker;
    var account = args.account;
    var mongoose = args.mongoose;
    var models = mongoose.models;
    var maxLimit = 50;
    //
    router.get('/:name/', function (req, res, next) {
        var collname = req.params.name;
        var limit = Number(req.query.limit) || maxLimit;
        var page = Number(req.query.page) || 1;
        var pop = Number(req.query.pop) || 0;
        var sortBy = req.query.sort || "name";
        var direction = Number(req.query.direction) || 1;
        var skip = (page - 1) * limit;
        //
        limit = limit > maxLimit ? maxLimit : limit;
        if (models.hasOwnProperty(collname)) {
            var model = models[collname];
            var popQuery = "";
            if (model.getPopQuery) {
                popQuery = model.getPopQuery(pop);
                if (!Object.keys(popQuery).length) popQuery = "";
            }
            model.count().lean().catch(function (e) {
                next(e)
            }).then(function (length) {
                model.find()
                .sort({[sortBy] : direction}).skip(skip).limit(limit)
                .populate(popQuery).lean().then(function (docs) {
                    var rows = mongoose.normalize(docs);
                    res.send({
                        populate : popQuery,
                        limit : limit,
                        page : page,
                        sort : {[sortBy] : direction},
                        total : length,
                        data : rows,
                    })
                })
                .catch(function (e) {
                    next(e)
                })
            })
        } else next(req.params);
    });
    router.get('/:name/:id', function (req, res, next) {
        var collname = req.params.name;
        var id = req.params.id;
        var pop = Number(req.query.pop) || 0;
        if (models.hasOwnProperty(collname)) {
            var model = models[collname];
            var popQuery = "";
            if (model.getPopQuery) {
                popQuery = model.getPopQuery(pop);
                if (!Object.keys(popQuery).length) popQuery = "";
            }
            model.findOne({_id : id}).populate(popQuery).lean().then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send({data : rows})
            })
            .catch(function (e) {
                next(e)
            })
        } else next(req.params);
    });
    return router;
};