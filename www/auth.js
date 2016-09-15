var token = require('rand-token');
//
module.exports = function (global, locals, user) {
    var base64 = require(global.libs + 'base64');
    return function (req, res, next) {
        var method = req.method;
        var body = req.body;
        var path = req._parsedUrl.pathname;
        var session = req.session;
        var store = req.sessionStore;
        var cookieId = req.cookies[global.name] || "";
        //var query = req.query;
        //var secret = req.secret;
        //var sessionId = req.sessionID;
        //var signedCookies = req.signedCookies;
        //
        locals.loginMsg = locals.loginMsg || [];
        if (cookieId) {
            if (path == '/logout') {
                res.clearCookie(global.name);
                res.redirect('/');
            } else {
                var usrhash = cookieId.substr(cookieId.indexOf('/') + 1);
                var usr = base64.decode(usrhash);
                //
                if (!usr) locals.loginMsg.push({'nobody\'s cookie' : cookieId});
                if (locals.loginMsg.length) {
                    locals.loginMsgTxt = 'Session fail #1';
                    res.clearCookie(global.name);
                    res.redirect('/login');
                } else {
                    user.findOne({username : usr}).lean().exec(function (err, user) {
                        if (!err) {
                            if (!user) locals.loginMsg.push({'invalid username' : usr});
                        } else {
                            locals.loginMsg.push({'Error 001' : err});
                        }
                        //
                        if (locals.loginMsg.length) {
                            locals.loginMsgTxt = 'Session fail #2';
                            res.clearCookie(global.name);
                            res.redirect('/login');
                        } else {
                            store.get(cookieId, function (err, s) {
                                if (!err && s) {
                                    var now = new Date().getTime();
                                    var until = new Date(s.expires).getTime() + s.originalMaxAge;
                                    if (until <= now) {
                                        locals.loginMsg.push({'expired cookie' : cookieId});
                                        //todo : some code here (if you wanna destroy this session on db)
                                        //store.destroy(cookieId)
                                    }
                                } else if (!s) {
                                    locals.loginMsg.push({'invalid cookie' : cookieId});
                                } else {
                                    locals.loginMsg.push({'Error 002' : err});
                                }
                                //
                                if (locals.loginMsg.length) {
                                    locals.loginMsgTxt = 'Session fail #3';
                                    res.clearCookie(global.name);
                                    res.redirect('/login');
                                } else {
                                    //extending session time
                                    store.set(cookieId, session.cookie, function (err) {
                                        if (err) locals.loginMsg.push({'Error 003' : err});
                                        if (locals.loginMsg.length) {
                                            locals.loginMsgTxt = 'Session fail #4';
                                            res.clearCookie(global.name);
                                            res.redirect('/login');
                                        } else {
                                            //success login here..
                                            res.cookie(global.name, cookieId, session.cookie);
                                            req.user = {
                                                user : user,
                                                cookie : {
                                                    id : cookieId,
                                                    path : session.cookie.path,
                                                    originalMaxAge : session.cookie.originalMaxAge,
                                                    httpOnly : session.cookie.httpOnly,
                                                    expires : session.cookie._expires
                                                }
                                            };
                                            if (path == '/login' || path == "/registration" || path == "/forgot") {
                                                res.redirect('/');
                                            } else next();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        } else {
            if (method == 'POST' && path == '/signin') {
                user.findOne({username : body.username}, function (err, user) {
                    if (!err) {
                        if (!user) locals.loginMsg.push({'invalid username' : body.username});
                    } else {
                        locals.loginMsg.push({'Error 004' : err});
                    }
                    //
                    if (locals.loginMsg.length) {
                        locals.loginMsgTxt = 'Login fail';
                        res.redirect('/login');
                    } else {
                        user.pwdCheck(body.password, function (err, valid) {
                            if (err) locals.loginMsg.push({'fail calculating work factor' : body.password})
                            if (!valid) locals.loginMsg.push({'invalid password' : body.password})
                            if (locals.loginMsg.length) {
                                locals.loginMsgTxt = 'Login fail';
                                res.redirect('/login');
                            } else {
                                var id = token.generate(32) + '/' + base64.encode(body.username);
                                store.set(id, session.cookie, function (err) {
                                    if (!err) res.cookie(global.name, id, session.cookie);
                                    else locals.loginMsg.push({'Error 005' : err});
                                    //
                                    if (locals.loginMsg.length) {
                                        locals.loginMsgTxt = 'Extend fail';
                                        res.redirect('/login');
                                    } else {
                                        res.redirect('/');
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.clearCookie(global.name);
                next();
            }
        }
    };
};