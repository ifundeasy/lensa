// includes
var express = require('express');
var router = express.Router();
//

module.exports = function (app, info) {

    app.get('/', function (req, res, next) {
        var message = {
            name : info.name,
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

