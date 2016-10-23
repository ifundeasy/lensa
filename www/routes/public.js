var namescape = "public";
var page = require('express').Router();
var api = require('express').Router();
var httpCode = require('http').STATUS_CODES;
var bcrypt = require('bcrypt');
//
module.exports = function (args, app) {
    var global = args.global;
    var locals = args.locals;
    var worker = args.worker;
    var account = args.account;
    var mongoose = args.mongoose;
    var maxLimit = 50;
    var Collection = (function () {
        var o = {};
        var models = mongoose.models;
        for (var m in models) o[models[m].collection.name] = mongoose.models[m];
        return o;
    })();

    var publicOrganizationId = "580b731cdcba0f490c72c7a9";
    var publicGroupId = "580a24727709cb078b9fe176";

    //
    api.post('/', function (req, res, next) {
        var class_route = req.header("Class");
        switch (class_route) {
            case 'user/create':
                // check for mandatory field
                if (req.body.first_name && req.body.username && req.body.email && req.body.password) {
                    // check for username and email availability
                    var User = Collection['users'];
                    User.find({username : req.body.username}).or({email : req.body.email}).then(function (docs) {
                        if (docs.length != 0) {
                            var body = {
                                "status" : 0,
                                "message" : "username or email is already registered"
                            };
                            res.status(500).send(body);
                        } else {
                            var newUser = new User({
                                username : req.body.username,
                                name : {
                                    first : req.body.first_name,
                                    last : req.body.last_name || null
                                },
                                "phone.value" : req.body.phone || null,
                                email : {
                                    value : req.body.email
                                },
                                password : req.body.password,
                                'organizations._id' : publicOrganizationId, // organization "public"
                                'groups._id' : publicGroupId // usergroup "public"
                            });
                            newUser.save().then(function (doc) {
                                var body = {
                                    "status" : 1,
                                    "message" : "new user has been created"
                                };
                                res.status(201).send(body);
                            }).catch(function (e) {
                                var body = {
                                    "status" : 0,
                                    "message" : e
                                };
                                res.status(500).send(body);
                            });
                        }
                    }).catch(function (e) {
                        var body = {
                            "status" : 0,
                            "message" : e
                        };
                        res.status(500).send(body);
                    });
                } else {
                    var body = {
                        "status" : 0,
                        "message" : "field is not completed"
                    };
                    res.status(500).send(body);
                }
                break;
            case 'login':
                var User = Collection['users'];
                User.findOne({username : req.body.username, active : true}).then(function(doc){
                    if(doc!==null){
                        doc.pwdCheck(req.body.password, function(err, success){
                            if(err){
                                var body = {
                                    "status" : 0,
                                    "message" : err
                                };
                                res.status(500).send(body); 
                            } else {
                                if(success){
                                    var factory = 7;
                                    // generate a salt
                                    bcrypt.genSalt(factory, function (error, salt) {
                                        if (error){
                                            var body = {
                                                "status" : 0,
                                                "message" : error
                                            };
                                            res.status(500).send(body);   
                                        } else {
                                            var tokenString = req.body.username + Math.random().toString(36).substr(2, 5);
                                            // hash the token using our new salt
                                            bcrypt.hash(tokenString, salt, function (errorhash, hash) {
                                                if(!errorhash){
                                                    var body = {
                                                        "status" : 0,
                                                        "message" : errorhash
                                                    };
                                                    res.status(500).send(body); 
                                                } else {
                                                    doc.token = hash;
                                                    doc.save().then(function(doc){
                                                        var body = {
                                                            "status" : 1,
                                                            "token" : hash
                                                        };
                                                        res.status(200).send(body); 
                                                    }).catch(function(e){
                                                        var body = {
                                                            "status" : 0,
                                                            "message" : e
                                                        };
                                                        res.status(500).send(body);  
                                                    });    
                                                }
                                                
                                            });
                                        }
                                    });
                                } else {
                                    var body = {
                                        "status" : 0,
                                        "message" : "invalid username password combination"
                                    };
                                    res.status(500).send(body); 
                                }
                            }
                        });
                    } else {
                        var body = {
                            "status" : 0,
                            "message" : "invalid user"
                        };
                        res.status(500).send(body);
                    }
                }).catch(function(e){
                    var body = {
                        "status" : 0,
                        "message" : e
                    };
                    res.status(500).send(body);
                });
                break;
            case 'logout':
                break;
            case 'report/all':

                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        var start = parseInt(req.body.start);
                        var limit = parseInt(req.body.limit);
                        Post.find().sort('createdAt').skip(start).limit(limit).then(function (docs) {
                            var body = {
                                "status" : 1,
                                "data" : docs,
                                "nextToken": newToken
                            };
                            res.status(200).send(body);
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

            case 'report/get':
                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        Post.findOne({_id : req.body._id}).then(function (doc) {
                            if (doc !== null) {
                                var body = {
                                    "status" : 1,
                                    "data" : doc,
                                    "nextToken": newToken
                                };
                                res.status(200).send(body);
                            } else {
                                var body = {
                                    "status" : 0,
                                    "message" : "invalid report id",
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

            case 'report/create':

                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];                
                        var postobj = {
                            text : req.body.text,
                            "users._id" : req.loggedUser._id,
                            "organizations._id" : publicOrganizationId, // default : PUBLIC organization
                            statuses : [],
                            comments : [],
                            lat : req.body.lat,
                            long : req.body.long
                        };
                        if (req.body.title) postobj.title = req.body.title;
                        var newPost = new Post(postobj);
                        newPost.save().then(function (doc) {
                            var body = {
                                "status" : 1,
                                "message" : "new report has been posted",
                                "nextToken" : newToken
                            };
                            res.status(201).send(body);
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken" : newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

            case 'report/delete':

                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        Post.findOne({_id : req.body._id, "users._id": req.loggedUser._id}).remove().then(function (doc) {
                            if (doc !== null) {
                                var body = {
                                    "status" : 1,
                                    "message" : "report has been deleted",
                                    "nextToken" : newToken
                                };
                                res.status(200).send(body);
                            } else {
                                var body = {
                                    "status" : 0,
                                    "message" : "invalid report id",
                                    "nextToken" : newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken" : newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

            case 'comment/create':

                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        Post.findOne({_id : req.body.parent_id}).then(function (doc) {
                            if (doc !== null) {
                                var newComment = {
                                    text : req.body.text,
                                    "users._id" : req.loggedUser._id,
                                };
                                doc.comments.push(newComment);
                                doc.save(function (err) {
                                    if (!err) {
                                        var body = {
                                            "status" : 1,
                                            "message" : "comment has been posted",
                                            "nextToken" : newToken
                                        };
                                        res.status(200).send(body);
                                    } else {
                                        var body = {
                                            "status" : 0,
                                            "message" : err,
                                            "nextToken" : newToken
                                        };
                                        res.status(500).send(body);
                                    }
                                });
                            } else {
                                var body = {
                                    "status" : 0,
                                    "message" : "invalid report id",
                                    "nextToken" : newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken" : newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

            case 'comment/delete':
                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        Post.findOne({_id : req.body.parent_id}).then(function (doc) {
                            if (doc !== null) {
                                var rm = doc.comments.id(req.body._id).remove(); // TODO: cek id dan user pembuatnya juga. jadi cuma si orang yang buat komentar yang bisa ngehapusnya
                                doc.save(function (err) {
                                    if (!err) {
                                        var body = {
                                            "status" : 1,
                                            "message" : "comment has been removed",
                                            "nextToken" : newToken
                                        };
                                        res.status(200).send(body);
                                    } else {
                                        var body = {
                                            "status" : 0,
                                            "message" : err,
                                            "nextToken" : newToken
                                        };
                                        res.status(500).send(body);
                                    }
                                });
                            } else {
                                var body = {
                                    "status" : 0,
                                    "message" : "invalid report id",
                                    "nextToken" : newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken" : newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

            case 'user/get':

                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var User = Collection['users'];
                        User.findOne({_id : req.body._id}).select('-password').then(function (doc) {
                            if (doc !== null) {
                                var body = {
                                    "status" : 1,
                                    "data" : doc,
                                    "nextToken" : newToken
                                };
                                res.status(200).send(body);
                            } else {
                                var body = {
                                    "status" : 0,
                                    "message" : "invalid user id",
                                    "nextToken" : newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken" : newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

            case 'user/update':

                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var User = Collection['users'];
                        User.findOne({_id : req.loggedUser._id}).then(function (doc) {
                            if (doc !== null) {
                                if (req.body.username) doc.username = req.body.username;
                                if (req.body.first_name) doc.name.first = req.body.first_name;
                                if (req.body.last_name) doc.name.last = req.body.last_name;
                                if (req.body.gender) doc.gender = req.body.gender;
                                if (req.body.password) doc.password = req.body.password;
                                if (req.body.email) doc.email = req.body.email;
                                if (req.body.phone) doc.phone = req.body.phone;
                                if (req.body.address) doc.address = req.body.address;
                                if (req.body.country) doc.country = req.body.country;
                                if (req.body.state) doc.state = req.body.state;
                                if (req.body.zipcode) doc.zipcode = req.body.zipcode;
                                if (req.body.birthDate) doc.birthDate = req.body.birthDate;
                                doc.save(function (err) {
                                    if (!err) {
                                        var body = {
                                            "status" : 1,
                                            "message" : "user data has been updated",
                                            "nextToken" : newToken
                                        };
                                        res.status(200).send(body);
                                    } else {
                                        var body = {
                                            "status" : 0,
                                            "message" : err,
                                            "nextToken" : newToken
                                        };
                                        res.status(500).send(body);
                                    }
                                });
                            } else {
                                var body = {
                                    "status" : 0,
                                    "message" : "invalid user id",
                                    "nextToken" : newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken" : newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

            case 'organization/get':

                var nextToken = page.refreshToken(req.header('Token'), function(errortoken, newToken){
                    if(errortoken){
                        var body = {
                            "status" : 0,
                            "message" : "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Organization = Collection['organizations'];
                        Organization.findOne({_id : req.body._id}).then(function (doc) {
                            if (doc !== null) {
                                var body = {
                                    "status" : 1,
                                    "data" : doc,
                                    "nextToken" : newToken
                                };
                                res.status(200).send(body);
                            } else {
                                var body = {
                                    "status" : 0,
                                    "message" : "invalid organization id",
                                    "nextToken" : newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status" : 0,
                                "message" : e,
                                "nextToken" : newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                    
                });
                break;

        }
    })

    //

    /*page.use(function(req, res, next){
        var group = req.logged.user.groups.name.toLowerCase().replace(/\s/g, "");
        if (group !== namescape) next(group)
        else next();
    });*/

    // token checking
    page.use(function(req, res, next){
        // some api does not require token
        var excludedApis = ["user/create", "login", "logout"];
        if(excludedApis.indexOf(req.header("Class"))==-1){
            if(req.header("Token")){
                var token = req.header("Token");
                var User = Collection['users'];
                User.findOne({ token : token}).then(function(doc){
                    if (doc !== null){
                        console.log("token valid");
                        req.loggedUser = doc;
                        next();
                    } else {
                        console.log("token invalid");
                        var body = {
                            "status" : 0,
                            "message" : "Authorization token invalid or has been resetted"
                        };
                        res.status(403).send(body);
                    }

                }).catch(function(e){
                    var body = {
                        "status" : 0,
                        "message" : e
                    };
                    res.status(500).send(body);
                });
            } else {
                var body = {
                    "status" : 0,
                    "message" : "Authorization token required"
                };
                res.status(403).send(body);
            }
        } else {
            next();
        }
    });

    //token refresh
    page.refreshToken = function(oldToken, cb){

        var User = Collection['users'];
        User.findOne({ token: oldToken}).then(function(doc){
            var factory = 7;
            // generate a salt
            bcrypt.genSalt(factory, function (error, salt) {
                if (error){
                    cb(true);
                } else {
                    var tokenString = doc.username + Math.random().toString(36).substr(2, 5);
                    // hash the token using our new salt
                    bcrypt.hash(tokenString, salt, function (errorhash, hash) {
                        doc.token = hash;
                        doc.save().then(function(doc){
                            cb(null, hash);
                        }).catch(function(e){
                            cb(true);  
                        });
                    });
                }
            });
        }).catch(function(e){
            cb(true);
        });

    }

    page.use('/!', api);
    page.get('/', function (req, res, next) {
        locals.www = {
            name : global.name,
            description : global.description,
            activePage : req.url, //todo : buat apa lih?
            version : global.version
        };
        res.render(namescape, locals.www);
    });
    return page;
};