var router = require('express').Router();
module.exports = function (args) {
    var global = args.global;
    var locals = args.locals;
    var worker = args.worker;
    var account = args.account;
    var mongoose = args.mongoose;
    //
    router.get('/', function (req, res, next) {
        res.render('administrator', {
            name : global.name,
            activePage : req.url,
            description : global.description,
            version : global.version
        });
    });
    return router;
};