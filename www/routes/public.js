var namescape = "public";
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
    page.use(function(req, res, next){
        var group = req.logged.user.groups.name.toLowerCase().replace(/\s/g, "");
        if (group !== namescape) next(group)
        else next();
    });
    page.use('/!', api);
    page.get('/', function (req, res, next) {
        locals.www = {
            name : global.name,
            description : global.description,
            activePage : req.url, //todo : buat apa lih?
            version : global.version
        };
        res.render(namescape, locals.www);
    });
    return page;
};