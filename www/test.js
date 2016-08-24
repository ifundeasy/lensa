var env = process.env;
var info = {
    version : env.npm_package_version,
    port : env.npm_package_port,
    name : env.npm_package_name,
    description : env.npm_package_description,
    home : env.PWD + '/',
    node : env.NODE,
    pid : process.pid,
    ip : require(env.PWD + '/libs/getip')(),
    dbConfig : require('./config/mongo'),
    maxAge : 15 * 60 * 1000 //15 munites session idle
};
var path = require('path'),
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
var pid = info.pid,
    name = info.name,
    ip = info.ip,
    port = info.port,
    home = info.home,
    app = express(),
    locals = app.locals,
    Db = require(home + 'libs/db'),
    base64 = require(home + 'libs/base64'),
    server;
//
var main = function (err, db) {
    var mongoose = db.mongoose;
    var User = require(home + 'models/user')(mongoose);
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
        secret : info.name,
        saveUninitialized : false,
        resave : false,
        //saveUninitialized : false, //don't create session until something stored
        //resave: false, //don't save session if unmodified
        cookie : {maxAge : info.maxAge},
        store : new store({
            mongooseConnection : mongoose.connection,
            ttl : 2 * 24 * 60 * 60
        })
    };
    //
    app.set('title', name);
    app.set('port', port);
    app.set('x-powered-by', false);
    app.set('views', path.join(home, 'views/'));
    app.set('view engine', 'ejs');
    //app.set('env', 'production');
    //
    app.use(cookieParser());
    app.use(express.static(path.join(home, 'public')));
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
        var cookieId = req.cookies[name] || "";
        //var query = req.query;
        //var secret = req.secret;
        //var sessionId = req.sessionID;
        //var signedCookies = req.signedCookies;
        //
        app.msg = app.msg || [];
        console.log(method, req.url, Object.keys(body).length ? body : "");
        if (cookieId) {
            if (path == '/logout') {
                res.clearCookie(name);
                res.redirect('/');
            } else {
                var usrhash = cookieId.substr(cookieId.indexOf('/') + 1);
                var usr = base64.decode(usrhash);
                //
                if (!usr) app.msg.push({'nobody\'s cookie' : cookieId});
                if (app.msg.length) {
                    app.msgTxt = 'Session fail #1';
                    res.clearCookie(name);
                    res.redirect('/login');
                } else {
                    User.findOne({username : usr}, function (err, user) {
                        if (!err) {
                            if (!user) app.msg.push({'invalid username' : usr});
                        } else {
                            app.msg.push({'Error 001' : err});
                        }
                        //
                        if (app.msg.length) {
                            app.msgTxt = 'Session fail #2';
                            res.clearCookie(name);
                            res.redirect('/login');
                        } else {
                            store.get(cookieId, function (err, s) {
                                if (!err) {
                                    if (s) {
                                        var now = new Date().getTime();
                                        var until = new Date(s.expires).getTime() + s.originalMaxAge;
                                        if (until <= now) {
                                            app.msg.push({'expired cookie' : cookieId});
                                            //todo : some code here (if you wanna destroy this session on db)
                                            //store.destroy(cookieId)
                                        }
                                    } else {
                                        app.msg.push({'invalid cookie' : cookieId});
                                    }
                                } else {
                                    app.msg.push({'Error 002' : err});
                                }
                                if (app.msg.length) {
                                    app.msgTxt = 'Session fail #3';
                                    res.clearCookie(name);
                                    res.redirect('/login');
                                } else {
                                    //extending session time
                                    store.set(cookieId, session.cookie, function (err) {
                                        if (err) app.msg.push({'Error 003' : err});
                                        if (app.msg.length) {
                                            app.msgTxt = 'Session fail #4';
                                            res.clearCookie(name);
                                            res.redirect('/login');
                                        } else {
                                            res.cookie(name, cookieId, session.cookie);
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
                            if (!isValid(body.password, user.password)) app.msg.push({'invalid password' : body.password});
                        } else {
                            app.msg.push({'invalid username' : body.username});
                        }
                    } else {
                        app.msg.push({'Error 004' : err});
                    }
                    //
                    if (app.msg.length) {
                        app.msgTxt = 'Login fail';
                        res.redirect('/login');
                    } else {
                        var id = token.generate(32) + '/' + base64.encode(body.username);
                        store.set(id, session.cookie, function (err) {
                            if (!err) res.cookie(name, id, session.cookie);
                            else app.msg.push({'Error 005' : err});
                            //
                            if (app.msg.length) {
                                app.msgTxt = 'Extend fail';
                                res.redirect('/login');
                            } else {
                                res.redirect('/');
                            }
                        });
                    }
                });
            } else {
                res.clearCookie(name);
                if (path == '/login') next();
                else res.redirect('/login');
            }
        }
    });
    //app.use('/api', require(home + 'routes/api')({
    //    master : info,
    //    locals : locals,
    //    passport : passport
    //}));
    app.get('/login', function (req, res, next) {
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
    //
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    if (app.get('env') !== 'production') {
        app.use(morgan('dev'));
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                name : info.name,
                description : info.description,
                version : info.version,
                message : err.message,
                error : err
            });
        });
    } else {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                name : info.name,
                description : info.description,
                version : info.version,
                message : err.message,
                error : {}
            });
        });
    }
    //
    server = http.createServer(app);
    server.timeout = 5 * 60 * 1000; //5 minutes
    server.on('error', function onError(error) {
        if (error.syscall !== 'listen') throw error;
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
    server.on('listening', function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string' ? addr : addr.port;
        console.info(pid.toString(), 'Listening on ' + ip + ':' + bind);
    });
    server.listen(port);
};
//
new Db(info.dbConfig).open({
    dbname : 'eok',
    username : 'admin',
    password : 'admin',
    callback : function (err, con, db) {
        if (!err) main.apply(main, arguments);
        else console.log('> Error open connection', err)
    }
});