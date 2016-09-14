var router = require('express').Router();
module.exports = function (args) {
    var global = args.global;
    var locals = args.locals;
    var worker = args.worker;
    var account = args.account;
    var mongoose = args.mongoose;
    var models = mongoose.models;
    //
    router.get('/:name/', function (req, res, next) {
        var collname = req.params.name;
        var pop = Number(req.query.pop);

        if (models.hasOwnProperty(collname)) {
            var model = models[collname];
            var popQuery = model.getPopQuery(pop);

            res.send(popQuery)
            /*model.find({})
            .exec()
            .then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send(rows)
            })
            .catch(function (e) {
                next(e)
            })*/
        } else next(req.params);
    });
    router.get('/:name/:id', function (req, res, next) {
        console.log(req.params);
        res.end();
    });
    return router;
};