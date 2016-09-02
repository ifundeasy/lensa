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
    bcrypt = require('bcrypt'),
    connectMongo = require('connect-mongo'),
    token = require('rand-token');
//
var W, worker, account;
var httpFn = function (err, db) {
    var me = httpFn;
    var app = express();
    var mongoose = db.mongoose;
    var models = require(W.models)(W.models, mongoose);
    var base64 = require(W.libs + 'base64');
    var www = app.locals;
    //
    var User = mongoose.models['user'];
    var genHash = function (str) {
        return bcrypt.hashSync(str, bcrypt.genSaltSync(7));
    };
    var isValid = function (str, hash) {
        return bcrypt.compareSync(str, hash);
    };
    //User.create({
    //    username : 'afa',
    //    password : genHash('afa'),
    //}, function (err, small) {
    //    console.log('create', arguments)
    //    User.find({}, function () {
    //        console.log(arguments)
    //    });
    //});
    var store = connectMongo(expressSession);
    var session = {
        secret : W.name,
        saveUninitialized : false,
        resave : false,
        //saveUninitialized : false, //don't create session until something stored
        //resave: false, //don't save session if unmodified
        cookie : {maxAge : W.sessionAge},
        store : new store({
            mongooseConnection : mongoose.connection,
            ttl : 2 * 24 * 60 * 60
        })
    };
    //
    app.set('title', W.name);
    app.set('port', W.port);
    app.set('x-powered-by', false);
    app.set('views', path.join(W.home, 'views/'));
    app.set('view engine', 'ejs');
    app.use(cookieParser());
    app.use(express.static(path.join(W.home, 'public')));
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
    app.use(expressSession(session), function (req, res, next) {
        var method = req.method;
        var body = req.body;
        var path = req._parsedUrl.pathname;
        var session = req.session;
        var store = req.sessionStore;
        var cookieId = req.cookies[W.name] || "";
        //var query = req.query;
        //var secret = req.secret;
        //var sessionId = req.sessionID;
        //var signedCookies = req.signedCookies;
        //
        www.loginMsg = www.loginMsg || [];
        console.log(W.processId.toString(), method, req.url, Object.keys(body).length ? body : "");
        if (cookieId) {
            if (path == '/logout') {
                res.clearCookie(W.name);
                res.redirect('/');
            } else {
                var usrhash = cookieId.substr(cookieId.indexOf('/') + 1);
                var usr = base64.decode(usrhash);
                //
                if (!usr) www.loginMsg.push({'nobody\'s cookie' : cookieId});
                if (www.loginMsg.length) {
                    www.loginMsgTxt = 'Session fail #1';
                    res.clearCookie(W.name);
                    res.redirect('/login');
                } else {
                    User.findOne({username : usr}, function (err, user) {
                        if (!err) {
                            if (!user) www.loginMsg.push({'invalid username' : usr});
                        } else {
                            www.loginMsg.push({'Error 001' : err});
                        }
                        //
                        if (www.loginMsg.length) {
                            www.loginMsgTxt = 'Session fail #2';
                            res.clearCookie(W.name);
                            res.redirect('/login');
                        } else {
                            store.get(cookieId, function (err, s) {
                                if (!err) {
                                    if (s) {
                                        var now = new Date().getTime();
                                        var until = new Date(s.expires).getTime() + s.originalMaxAge;
                                        if (until <= now) {
                                            www.loginMsg.push({'expired cookie' : cookieId});
                                            //todo : some code here (if you wanna destroy this session on db)
                                            //store.destroy(cookieId)
                                        }
                                    } else {
                                        www.loginMsg.push({'invalid cookie' : cookieId});
                                    }
                                } else {
                                    www.loginMsg.push({'Error 002' : err});
                                }
                                if (www.loginMsg.length) {
                                    www.loginMsgTxt = 'Session fail #3';
                                    res.clearCookie(W.name);
                                    res.redirect('/login');
                                } else {
                                    //extending session time
                                    store.set(cookieId, session.cookie, function (err) {
                                        if (err) www.loginMsg.push({'Error 003' : err});
                                        if (www.loginMsg.length) {
                                            www.loginMsgTxt = 'Session fail #4';
                                            res.clearCookie(W.name);
                                            res.redirect('/login');
                                        } else {
                                            res.cookie(W.name, cookieId, session.cookie);
                                            if (path == '/login') res.redirect('/');
                                            else next();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        } else {
            if (method == 'POST' && path == '/auth') {
                User.findOne({username : body.username}, function (err, user) {
                    if (!err) {
                        if (user) {
                            if (!isValid(body.password, user.password)) www.loginMsg.push({'invalid password' : body.password});
                        } else {
                            www.loginMsg.push({'invalid username' : body.username});
                        }
                    } else {
                        www.loginMsg.push({'Error 004' : err});
                    }
                    //
                    if (www.loginMsg.length) {
                        www.loginMsgTxt = 'Login fail';
                        res.redirect('/login');
                    } else {
                        var id = token.generate(32) + '/' + base64.encode(body.username);
                        store.set(id, session.cookie, function (err) {
                            if (!err) res.cookie(W.name, id, session.cookie);
                            else www.loginMsg.push({'Error 005' : err});
                            //
                            if (www.loginMsg.length) {
                                www.loginMsgTxt = 'Extend fail';
                                res.redirect('/login');
                            } else {
                                res.redirect('/');
                            }
                        });
                    }
                });
            } else {
                res.clearCookie(W.name);
                if (path == '/login') next();
                else res.redirect('/login');
            }
        }
    });
    //
    app.use('/', require(W.routes + 'page')({
        W : W,
        www : www,
        worker : worker,
        account : account,
        mongoose : mongoose
    }));
    app.use('/api', require(W.routes + 'api')({
        W : W,
        www : www,
        worker : worker,
        account : account,
        mongoose : mongoose
    }));
    //
    me.server = worker.httpServer;
    me.server.timeout = W.timeOut;
    me.server.on('request', app);
    me.server.on('error', function onError(error) {
        if (error.syscall !== 'listen') throw error;
        var port = W.port;
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
    me.server.on('listening', function onListening() {
        var addr = app.address();
        var bind = typeof addr === 'string' ? addr : addr.port;
        console.info(W.processId.toString(), 'Listening on ' + W.ip + ':' + bind);
    });
};
//
var socketFn = function (err, db) {
    var me = socketFn;
    var count = 0;
    me.server = worker.scServer;
    me.server.on('connection', function (socket) {
        // Some sample logic to show how to handle client events,
        // replace this with your own logic
        socket.on('sampleClientEvent', function (data) {
            count++;
            console.log('Handled sampleClientEvent', data);
            me.server.exchange.publish('sample', count);
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
//
module.exports.run = function (workr) {
    worker = workr;
    W = (function () {
        var opts = worker.options;
        var ip, home = opts.paths.appDirPath + '/';
        try {
            ip = require(home + 'libs/getip')()
        } catch (e) {
            ip = "localhost";
        }
        return {
            node : opts.node,
            home : home,
            libs : home + 'libs/',
            models : home + 'models/',
            config : home + 'config/',
            routes : home + 'routes/',
            name : opts.appName,
            description : opts.description,
            version : opts.version,
            processId : process.pid,
            instanceId : opts.id,
            workerCount : opts.workerCount,
            ip : ip,
            port : opts.port,
            timeOut : opts.timeOut,
            sessionAge : opts.sessionAge,
            processId : process.pid
        }
    })();
    account = {
        twitter : require(W.config + 'twitter'),
        mongo : require(W.config + 'mongo')
    };
    //
    account.mongo.database.callback = function (err, con, db) {
        if (!err) {
            httpFn.apply(httpFn, arguments);
            socketFn.apply(socketFn, arguments);
        } else console.log('> Error open connection', err)
    };
    var Db = require(W.libs + 'db');
    new Db(account.mongo.connection).open(account.mongo.database);
};
