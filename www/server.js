var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cors = require('cors'),
    assert = require('assert'),
    expressSession = require('express-session'),
    connectMongo = require('connect-mongo');
//
module.exports = function (global, worker, db) {
    var account = global.account;
    var mongoose = db.mongoose;
    var httpServer = worker.httpServer;
    var scServer = worker.scServer;
    var app = express();
    var locals = app.locals;
    var models = require(global.models)(global.models, mongoose);
    //
    var auth = require(global.home + 'auth');
    var store = connectMongo(expressSession);
    var session = {
        secret : global.name,
        saveUninitialized : false,
        resave : false,
        //saveUninitialized : false, //don't create session until something stored
        //resave: false,             //don't save session if unmodified
        cookie : {maxAge : global.sessionAge},
        store : new store({
            mongooseConnection : mongoose.connection,
            ttl : 2 * 24 * 60 * 60
        })
    };
    //
    var param = {
        global : global,
        locals : locals,
        worker : worker,
        account : account,
        mongoose : mongoose
    };
    //
    app.set('title', global.name);
    app.set('port', global.port);
    app.set('x-powered-by', false);
    app.set('views', path.join(global.home, 'views/'));
    app.set('view engine', 'ejs');
    app.use(cookieParser());
    app.use(express.static(path.join(global.home, 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(cors());
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    if (app.get('env') === 'production') {
        app.set('trust proxy', 1);
        session.cookie.secure = true;
    }
    app.use(expressSession(session), auth(global, locals, models.user));
    //
    app.get('/', function (req, res, next) {
        var type = req.auth.type = "root"; //todo : ini masih hardcode, next-nya baca dari userType;
        try {
            var route = require(global.routes + type);
            app.use('/' + type, route(param));
            res.redirect('/' + type);
        } catch (e) {
            next();
        }
    });
    /*
    //todo : block of stupid way. please see app.get('/', fn)
    //app.use('/root', require(global.routes + 'root')(param));
    //app.use('/moderator', require(global.routes + 'moderator')(param));
    //app.use('/administrator', require(global.routes + 'administrator')(param));
    //app.use('/implementor', require(global.routes + 'implementor')(param));
    */
    app.use('/api', require(global.routes + 'api')(param));
    app.get('/login', function (req, res, next) {
        var message = {
            error : {
                subject : locals.loginMsgTxt || "Logged out",
                value : locals.loginMsg.length ? locals.loginMsg : [{"Logged out" : 1}]
            },
            name : global.name,
            description : global.description,
            version : global.version
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
        locals.loginMsg = [];
        locals.loginMsgTxt = '';
    });
    //
    httpServer.timeout = global.timeOut;
    httpServer.on('request', app);
    httpServer.on('error', function onError(error) {
        if (error.syscall !== 'listen') throw error;
        var port = global.port;
        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    httpServer.on('listening', function onListening() {
        var addr = app.address();
        var bind = typeof addr === 'string' ? addr : addr.port;
        console.info(global.processId.toString(), 'Listening on ' + global.ip + ':' + bind);
    });
    //
    var count = 0;
    scServer.on('connection', function (socket) {
        // Some sample logic to show how to handle client events,
        // replace this with your own logic
        socket.on('sampleClientEvent', function (data) {
            count++;
            console.log('Handled sampleClientEvent', data);
            scServer.exchange.publish('sample', count);
        });
        var interval = setInterval(function () {
            socket.emit('rand', {
                rand : Math.floor(Math.random() * 5)
            });
        }, 1000);
        socket.on('disconnect', function () {
            clearInterval(interval);
        });
    });
};