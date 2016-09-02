// includes
var express = require('express');
var router = express.Router();
//

module.exports = function (app, info, mongoose) {

    router.get('/', function(req, res, next){
        // route '/' gak ada, redirect ke '/timeline' apabila publik atau '/dashboard' apabila internal yang login.
    });
    
    router.get('/timeline', function(req, res, next){
        // to do
    });
    
    router.get('/dashboard', function (req, res, next) {
        // cek role user
        // di versi ini, ada 2 role spesial : moderator & administrator yang gak bisa di-assign 
        
        // to do: buat logic untuk membedakan menu pelaksana, moderator, dan administrator
        var message = {
            name : info.name,
            activePage: req.url,
            description : info.description,
            version : info.version
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
    
    router.get('/reports', function(req, res, next){
        // to do
    });
    
    router.get('/maps', function(req, res, next){
        // to do
    });
    
    router.get('/users', function(req, res, next){
        // to do
    });
    
    router.get('/roles', function(req, res, next){
        // to do
    });
    
	router.get('/login', function (req, res, next) {
        var message = {
            error : {
                subject : app.msgTxt || "Logged out",
                value : app.msg.length ? app.msg : [{"Logged out" : 1}]
            },
            name : info.name,
            description : info.description,
            version : info.version
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
        app.msg = [];
        app.msgTxt = '';
    });
    

    return router;
};

