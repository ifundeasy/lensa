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
    nodemailer = require("nodemailer"),
    bcrypt = require('bcrypt'),
    httpCode = http.STATUS_CODES;
//
module.exports = function (global, worker, db) {
    var account = global.account;
    var config = global.config;
    var httpServer = worker.httpServer;
    var scServer = worker.scServer;
    var mongoose = db.mongoose;
    var app = express();
    var locals = app.locals;
    var mails = account.mail;
    var models = require(global.models)(mongoose, {
        directory: global.models,
        getCode4: global.getCode4,
        factory: global.factory,
        regEx: global.regEx
    });
    //
    var authenticate = require(global.home + 'authenticate');
    var store = connectMongo(expressSession);
    var session = {
        secret: global.name,
        saveUninitialized: false,
        resave: false,
        //saveUninitialized : false, //don't create session until something stored
        //resave: false,             //don't save session if unmodified
        cookie: {maxAge: global.sessionAge},
        store: new store({
            mongooseConnection: mongoose.connection,
            ttl: 2 * 24 * 60 * 60
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
            date_format: 'YYYYMMDD',
            filename: path.join(logger.path, 'morgan.%DATE%.log'),
            frequency: 'daily',
            verbose: false
        });
    };
    //
    var param = {
        global: global,
        locals: locals,
        worker: worker,
        account: account,
        mongoose: mongoose
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
    app.use(bodyParser.urlencoded({extended: true}));
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
        app.use(morgan(logger.format, {stream: logger.file}));
    } else {
        app.use(morgan(logger.format, {stream: logger.file}));
        app.use(morgan(logger.format));
    }
    /** **************************************************************************
     ** session, authorizing and authentication
     ** **************************************************************************/
    app.use(expressSession(session), authenticate(global, locals, models.user), function (req, res, next) {
        if (req.logged) req.logged.user = mongoose.normalize(req.logged.user);
        next();
    });
    /** **************************************************************************
     ** rest api & page by user groups
     ** **************************************************************************/
    var checking = function (req, res, next) {
        req.logged ? next() : res.redirect('/login');
    };
    app.get('/', function (req, res, next) {
        if (req.logged) {
            res.redirect('/' + req.logged.user.groups.name.toLowerCase().replace(/\s/g, ""));
        } else {
            res.redirect('/login')
        }
    });
    app.use('/admin', checking, require(global.routes + 'admin')(param));
    app.use('/moderator', checking, require(global.routes + 'moderator')(param));
    app.use('/implementor', require(global.routes + 'implementor')(param));
    app.use('/public', require(global.routes + 'public')(param));
    app.use('/root', checking, require(global.routes + 'root')(param));
    app.use('/superadmin', checking, require(global.routes + 'superadmin')(param));
    //app.use('/soap', require(global.routes + 'soap')(param));
    /** **************************************************************************
     ** standard http request
     ** **************************************************************************/
    app.get('/contact', function (req, res, next) {
        res.render('contact', {logged: req.logged ? 1 : 0});
    });
    app.get('/termspolicy', function (req, res, next) {
        res.render('termspolicy', {logged: req.logged ? 1 : 0});
    });
    app.get('/about', function (req, res, next) {
        var logged = req.logged ? 1 : 0;
        res.render('about', {logged: req.logged ? 1 : 0});
    });
    app.get('/registration', function (req, res, next) {
        res.render('registration');
    });
    app.post('/verify/:mode', function (req, res, next) {
        var mode = (req.params.mode || "").toLowerCase();
        var code = req.query.q || "";
        var data = req.logged.user;
        if (mode == "email" || mode == "phone") {
            data[mode] = data[mode] || {};
            var value = data[mode].value;
            if (code) {
                if (mode == "email") {
                    var q = value + new Date().getTime().toString(36)
                    bcrypt.genSalt(global.factory, function (err, salt) {
                        if (err) return next(err);
                        bcrypt.hash(q, salt, function (err, mailhash) {
                            if (err) return next(err);
                            else {
                                var selection = {_id: req.logged.user._id, active: true};
                                var docs = {
                                    "email.value": value,
                                    "email.verifyUrl": mailhash,
                                    "email.verified": false
                                };
                                //
                                models.user.update(selection, {$set: docs}, {runValidators: true})
                                .then(function (updated) {
                                    var url = account.domain + "/verify/email?q=" + mailhash;
                                    var sender = mails.system;
                                    var message = "";
                                    var smtp = nodemailer.createTransport({
                                        service: 'Gmail',
                                        authenticate: sender
                                    });
                                    var mailOptions = {
                                        from: sender.user,
                                        to: value,
                                        subject: "Lensa : Email verifiying",
                                        html: url
                                    };
                                    console.log("> Sending mail for verification", JSON.stringify(mailOptions, 0, 2))
                                    smtp.sendMail(mailOptions, function (e, info) {
                                        if (e) next(e);
                                        else {
                                            res.send({
                                                status: 200,
                                                message: httpCode[200],
                                                error: null,
                                                data: docs
                                            })
                                        }
                                    });
                                }).catch(function (e) {
                                    next(e)
                                });
                            }
                        });
                    });
                } else {
                    res.send({msg: "under developement"});
                }
            } else {
                next();
            }
        } else next();
    });
    app.get('/verify/:mode', function (req, res, next) {
        var mode = (req.params.mode || "").toLowerCase();
        var code = req.query.q || "";
        if (mode == "email" || mode == "phone") {
            var render = function (is, invalid) {
                res.render('emailVerify', {
                    invalid: invalid,
                    value: req.logged.user[mode].value,
                    verified: is,
                    name: param.global.name,
                    description: param.global.description,
                    version: param.global.version
                });
            };
            if (code) {
                if (mode == "email") {
                    if (req.logged.user.email.verifyUrl == code) {
                        var selection = {
                            _id: req.logged.user._id,
                            active: true
                        };
                        var doc = {"email.verified": false};
                        models.user.update(selection, {$set: doc}, {runValidators: true})
                        .then(function (updated) {
                            render(true);
                        }).catch(function (e) {
                            next(e)
                        });
                    } else render(req.logged.user.email.verified)
                } else {
                    //todo : under development
                    res.send({msg: "under developement"});
                }
            } else next();
        } else next();
    });
    app.get('/forgot', function (req, res, next) {
        res.render('forgot');
    });
    app.get('/login', function (req, res, next) {
        var message = {
            login: {
                subject: locals.loginMsgTxt || "Logged out",
                value: locals.loginMsg.length ? locals.loginMsg : [{"Logged out": 1}]
            },
            name: global.name,
            description: global.description,
            version: global.version
        };
        res.format({
            html: function () {
                res.render('login', message);
            },
            json: function () {
                res.json(message);
            },
            text: function () {
                res.send(JSON.stringify(message));
            }
        });
        //
        console.log('> Login', JSON.stringify(message.login));
        locals.loginMsg = [];
        locals.loginMsgTxt = '';
    });
    app.all('/logout', function (req, res, next) {
        res.clearCookie(global.name);
        res.redirect('/');
    });
    /** **************************************************************************
     ** http request error handling
     ** **************************************************************************/
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
            status: err.status || 500,
            message: err.message || "Oops! Something wrong",
            error: err.errors
        };
        //
        if (!(verb1 || verb2)) console.log("> ", JSON.stringify(locals.ERR));
        if (app.get('env') === 'development' && err.stack) {
            locals.ERR.trace = err.stack;
            //if (!(verb1 || verb2)) console.log("> ", locals.ERR.trace);
        }
        res.status(locals.ERR.status);
        res.format({
            html: function () {
                res.render('error', locals);
            },
            json: function () {
                res.json(locals.ERR);
            },
            text: function () {
                res.send(JSON.stringify(locals.ERR, 0, 2));
            }
        });
    });
    /** **************************************************************************
     ** web server setting
     ** **************************************************************************/
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
    /** **************************************************************************
     ** web socket setting
     ** **************************************************************************/
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
                rand: Math.floor(Math.random() * 5)
            });
        }, 1000);
        socket.on('disconnect', function () {
            clearInterval(interval);
        });
    });
};
