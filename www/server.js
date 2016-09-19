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
    connectMongo = require('connect-mongo'),
    dateformat = require('dateformat'),
    httpCode = http.STATUS_CODES;
//
module.exports = function (global, worker, db) {
    var account = global.account;
    var httpServer = worker.httpServer;
    var scServer = worker.scServer;
    var app = express();
    var locals = app.locals;
    var mongoose = db.mongoose;
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
    var forbiddenFn = function (msg) {
        var err = new Error();
        err.status = 403;
        err.message = httpCode[403];
        if (msg) err.stack = JSON.stringify(msg, 0, 2);
        return err
    };
    var logger = function () {
        logger.format = ':dtime :pid :method :url :status :response-time :res[content-length] :rbody';
        logger.path = path.join(global.home, 'log');
        fs.existsSync(logger.path) || fs.mkdirSync(logger.path);
        logger.file = require('file-stream-rotator').getStream({
            date_format : 'YYYYMMDD',
            filename : path.join(logger.path, 'morgan.%DATE%.log'),
            frequency : 'daily',
            verbose : false
        });
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
    logger();
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
        morgan.token('pid', function () {
            return process.pid
        });
        morgan.token('dtime', function () {
            return dateformat(new Date(), "yyyy-mm-dd HH:MM:ss");
        });
        morgan.token('rbody', function () {
            return JSON.stringify(req.body)
        });
        next();
    });
    if (app.get('env') == 'production') {
        app.set('trust proxy', 1);
        session.cookie.secure = true;
        app.use(morgan(logger.format, {stream : logger.file}));
    } else {
        app.use(morgan(logger.format, {stream : logger.file}));
        app.use(morgan(logger.format));
    }
    app.use(expressSession(session), auth(global, locals, models.user));
    //
    app.get('/', function (req, res, next) {
        if (req.user) {
            var type = req.user.type = "root";
            locals.www = {
                name: param.global.name,
                description: param.global.description,
                version: param.global.version,
                models : (function(){
                    var o = {}
                    for (var m in models) o[models[m].collection.name] = m;
                    return o
                })()
            };
            res.render(type, locals.www);
        } else {
            res.redirect('/login')
        }
    });
    //app.use('/api', require(global.routes + 'api')(param));
    app.use('/api', function (req, res, next) {
        req.user ? next() : res.redirect('/login');
    }, require(global.routes + 'api')(param));
    //
    app.get('/contact', function (req, res, next) {
        res.render('contact', {logged : req.user ? 1 : 0});
    });
    app.get('/termspolicy', function (req, res, next) {
        res.render('termspolicy', {logged : req.user ? 1 : 0});
    });
    app.get('/about', function (req, res, next) {
        var logged = req.user ? 1 : 0;
        res.render('about', {logged : req.user ? 1 : 0});
    });
    app.get('/registration', function (req, res, next) {
        res.render('registration');
    });
    app.get('/forgot', function (req, res, next) {
        res.render('forgot');
    });
    app.get('/login', function (req, res, next) {
        var message = {
            login : {
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
        console.log('> Login', JSON.stringify(message.login));
        locals.loginMsg = [];
        locals.loginMsgTxt = '';
    });
    /******************************************************************************/
    app.use(function (req, res, next) {
        var code = 404;
        var err = new Error();
        err.status = code;
        err.message = httpCode[code];
        next(err);
    });
    app.use(function (err, req, res, next) {
        //For avoid .map file error request.
        var verb1 = req.url.length - 7 == req.url.lastIndexOf(".js.map");
        var verb2 = req.url.length - 8 == req.url.lastIndexOf(".css.map");
        locals.ERR = {
            status : err.status || 500,
            message : err.message || "Oops! Something wrong.",
            error : err.errors
        };
        //
        if (!(verb1 || verb2)) console.log("> ", JSON.stringify(locals.ERR));
        if (app.get('env') === 'development' && err.stack) {
            locals.ERR.trace = err.stack;
            if (!(verb1 || verb2)) console.log("> ", locals.ERR.trace);
        }
        res.status(locals.ERR.status);
        res.format({
            html : function () {
                res.render('error', locals);
            },
            json : function () {
                res.json(locals.ERR);
            },
            text : function () {
                res.send(JSON.stringify(locals.ERR, 0, 2));
            }
        });
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
    httpServer.on('handshake', function () {
        //console.log(global.processId.toString(), 'Listening on ' + global.ip + ':' + global.port);
    });
    /******************************************************************************/
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