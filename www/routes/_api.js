var fs = require('fs');
var express = require('express');
var router = express.Router();
//
module.exports = function (args) {
    var master = args.master;
    var locals = args.locals;
    router.use(function (req, res, next) {
        //todo : Authorize, login system here..
        next();
    });
    router.use(function (req, res, next) {
        var data = [];
        if (fs.existsSync(master.home + 'config/navbar.json')) {
            var content = fs.readFileSync(master.home + 'config/navbar.json');
            data = JSON.parse(content);
            master.navbar = data;
            next();
        } else {
            console.log(master.home + 'data.json', 'not found!');
            res.end();
        }
    });
    router.get('/', function(req, res, next) {
        res.render('index', {
            name: master.name,
            description: master.description,
            version: master.version,
            navbar : master.navbar
        });
    });
    return router;
};