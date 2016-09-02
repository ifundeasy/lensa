var router = require('express').Router();
module.exports = function (args) {
    var W = args.W;
    var www = args.www;
    var worker = args.worker;
    var account = args.account;
    var mongoose = args.mongoose;
    //
    router.get('/', function (req, res, next) {
        // route '/' gak ada, redirect ke '/timeline' apabila publik atau '/dashboard' apabila internal yang login.
        res.render('index', {
            name : W.name,
            activePage : req.url,
            description : W.description,
            version : W.version
        });
    });
    router.get('/timeline', function (req, res, next) {
        // to do
    });
    router.get('/dashboard', function (req, res, next) {
        // cek role user
        // di versi ini, ada 2 role spesial : moderator & administrator yang gak bisa di-assign
        // to do: buat logic untuk membedakan menu pelaksana, moderator, dan administrator
        var message = {
            name : W.name,
            activePage : req.url,
            description : W.description,
            version : W.version
        };
        res.format({
            html : function () {
                res.render('index', message);
            },
            json : function () {
                res.json(message);
            },
            text : function () {
                res.send(JSON.stringify(message));
            }
        });
    });
    router.get('/reports', function (req, res, next) {
        // to do
    });
    router.get('/maps', function (req, res, next) {
        // to do
    });
    router.get('/users', function (req, res, next) {
        // to do
    });
    router.get('/roles', function (req, res, next) {
        // to do
    });
    router.get('/login', function (req, res, next) {
        var message = {
            error : {
                subject : www.loginMsgTxt || "Logged out",
                value : www.loginMsg.length ? www.loginMsg : [{"Logged out" : 1}]
            },
            name : W.name,
            description : W.description,
            version : W.version
        };
        res.format({
            html : function () {
                res.render('login', message);
            },
            json : function () {
                res.json(message);
            },
            text : function () {
                res.send(JSON.stringify(message));
            }
        });
        //
        console.log('> Login', JSON.stringify(message.error));
        www.loginMsg = [];
        www.loginMsgTxt = '';
    });
    return router;
};