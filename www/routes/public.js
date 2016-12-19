var namescape = "public";
var page = require('express').Router();
var api = require('express').Router();
var httpCode = require('http').STATUS_CODES;
var bcrypt = require('bcrypt');
var multer = require("multer");
var path = require('path');
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
    var mediadirpath = './public/img/post';
    var allowedExtensions = ['jpg', 'jpeg', 'png', 'mp4', '3gp', 'mov'];
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, mediadirpath);
        },
        filename: function (req, file, callback) {
            callback(null, req.loggedUser._id + '-' + Date.now() + path.extname(file.originalname));
        },
        fileFilter: function (req, file, cb) {
            if (allowedExtensions.indexOf(path.extension(file.originalname).substr(1)) === -1) {
                return cb(new Error('file format not supported'))
            }
            cb(null, true)
        }
    });
    var upload = multer({storage: storage}).single('postmedia');
    //
    var publicOrganizationId = "580b731cdcba0f490c72c7a9"; //todo : query ke db ya, find by name == public
    var publicGroupId = "580a24727709cb078b9fe176"; //todo : query ke db ya, find by name == public
    //
    api.refreshToken = function (oldToken, cb) {
        var User = Collection['users'];
        User.findOne({token: oldToken}).then(function (doc) {
            var factory = 7;
            // generate a salt
            bcrypt.genSalt(factory, function (error, salt) {
                if (error) {
                    console.log("cannot find matching token");
                    cb(true);
                } else {
                    var tokenString = doc.username + Math.random().toString(36).substr(2, 5);
                    // hash the token using our new salt
                    bcrypt.hash(tokenString, salt, function (errorhash, hash) {
                        doc.token = hash;
                        doc.save().then(function (doc) {
                            cb(null, hash);
                        }).catch(function (e) {
                            console.log(e);
                            cb(true);
                        });
                    });
                }
            });
        }).catch(function (e) {
            cb(true);
        });
    };
    // token checking section
    api.use(function (req, res, next) {
        // some api does not require token
        var excludedApis = ["user/create", "login", "logout", "register"];

        if (excludedApis.indexOf(req.header("Class")) === -1) {
            if (req.header("Token")) {
                var token = req.header("Token");
                var User = Collection['users'];
                User.findOne({token: token}).then(function (doc) {
                    if (doc !== null) {
                        console.log("token valid");
                        req.loggedUser = doc;
                        next();
                    } else {
                        console.log("token invalid");
                        var body = {
                            "status": 0,
                            "message": "Authorization token invalid or has been resetted"
                        };
                        res.status(403).send(body);
                    }
                }).catch(function (e) {
                    var body = {
                        "status": 0,
                        "message": e
                    };
                    res.status(500).send(body);
                });
            } else {
                var body = {
                    "status": 0,
                    "message": "Authorization token required"
                };
                res.status(403).send(body);
            }
        } else {
            next();
        }
    });
    api.post('/', function (req, res, next) {
        var class_route = req.header("Class");
        switch (class_route) {
            case 'user/create':
                // check for mandatory field
                if (req.body.first_name && req.body.username && req.body.email && req.body.password) {
                    // check for username and email availability
                    var User = Collection['users'];
                    User.find({username: req.body.username}).or({email: req.body.email}).then(function (docs) {
                        if (docs.length != 0) {
                            var body = {
                                "status": 0,
                                "message": "username or email is already registered"
                            };
                            res.status(500).send(body);
                        } else {
                            var newUser = new User({
                                username: req.body.username,
                                name: {
                                    first: req.body.first_name,
                                    last: req.body.last_name || null
                                },
                                "phone.value": req.body.phone || null,
                                email: {
                                    value: req.body.email
                                },
                                password: req.body.password,
                                'organizations._id': publicOrganizationId, // organization "public"
                                'groups._id': publicGroupId // usergroup "public"
                            });
                            newUser.save().then(function (doc) {
                                var body = {
                                    "status": 1,
                                    "message": "new user has been created"
                                };
                                res.status(201).send(body);
                            }).catch(function (e) {
                                var body = {
                                    "status": 0,
                                    "message": e
                                };
                                res.status(500).send(body);
                            });
                        }
                    }).catch(function (e) {
                        var body = {
                            "status": 0,
                            "message": e
                        };
                        res.status(500).send(body);
                    });
                } else {
                    var body = {
                        "status": 0,
                        "message": "field is not completed"
                    };
                    res.status(500).send(body);
                }
                break;
            case 'login':
                var User = Collection['users'];
                User.findOne({username: req.body.username, active: true})
                .populate({path: 'groups._id', select: 'name'})
                .populate({path: 'media._id', select: 'directory'})
                .then(function (doc) {
                    console.log("finished checking username");
                    if (doc !== null) {
                        console.log("user found!");
                        doc.pwdCheck(req.body.password, function (err, success) {
                            if (err) {
                                console.log("error at checking password");
                                var body = {
                                    "status": 0,
                                    "message": err
                                };
                                res.status(500).send(body);
                            } else {
                                if (success) {
                                    console.log("success checking the password");
                                    var factory = 7;
                                    // generate a salt
                                    bcrypt.genSalt(factory, function (error, salt) {
                                        if (error) {
                                            console.log("error at generating salt");
                                            var body = {
                                                "status": 0,
                                                "message": error
                                            };
                                            res.status(500).send(body);
                                        } else {
                                            console.log("success generating salt");
                                            var tokenString = req.body.username + Math.random().toString(36).substr(2, 5);
                                            console.log(tokenString);
                                            // hash the token using our new salt
                                            bcrypt.hash(tokenString, salt, function (errorhash, hash) {
                                                if (!errorhash) {
                                                    console.log("success creating hash");
                                                    doc.token = hash;
                                                    doc.save().then(function (doc) {
                                                        console.log("success saving the hash");
                                                        var userObject = doc.toObject();
                                                        var mediaDir = '/img/post/default.jpg';
                                                        if (userObject.hasOwnProperty('media')) {
                                                            mediaDir = '/img/post/' + userObject.media._id.directory
                                                        }
                                                        var body = {
                                                            status: 1,
                                                            token: hash,
                                                            userid: userObject._id,
                                                            group: userObject.groups._id.name,
                                                            media: mediaDir
                                                        }
                                                        console.log(userObject.hasOwnProperty('media'));
                                                        console.log(userObject);
                                                        res.status(200).send(body);
                                                    }).catch(function (e) {
                                                        console.log("error at saving the hash");
                                                        var body = {
                                                            "status": 0,
                                                            "message": e
                                                        };
                                                        res.status(500).send(body);
                                                    });
                                                } else {
                                                    console.log("error at creating hash");
                                                    console.log(errorhash);
                                                    console.log(hash);
                                                    var body = {
                                                        "status": 0,
                                                        "message": errorhash
                                                    };
                                                    res.status(500).send(body);
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    console.log("wrong password");
                                    var body = {
                                        "status": 0,
                                        "message": "invalid username password combination"
                                    };
                                    res.status(500).send(body);
                                }
                            }
                        });
                    } else {
                        var body = {
                            "status": 0,
                            "message": "invalid user"
                        };
                        res.status(500).send(body);
                    }
                }).catch(function (e) {
                    var body = {
                        "status": 0,
                        "message": e
                    };
                    res.status(500).send(body);
                });
                break;
            case 'logout':
                break;
            case 'report/all':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        var start = parseInt(req.body.start);
                        var limit = parseInt(req.body.limit);
                        Post.find({active: true}).sort('createdAt')
                        .populate({path: 'users._id', select: 'name media'})
                        .populate({path: 'media._ids', select: 'directory'})
                        .populate({path: 'categories._id', select: 'name'})
                        .populate({path: 'comments.users._id', select: 'name media'})
                        .populate({path: 'statuses.steps._id', select: 'name'})
                        .populate({path: 'organizations._id', select: 'name'})
                        .skip(start).limit(limit).then(function (docs) {
                            var Media = Collection['media'];
                            Media.populate(docs, {
                                path: 'users._id.media._id',
                                select: 'directory',
                            }, function (err, _docs) {
                                Media.populate(_docs, {
                                    path: 'comments.users._id.media._id',
                                    select: 'directory',
                                }, function (err, __docs) {
                                    var objArray = [];
                                    for (x = 0; x < _docs.length; x++) {
                                        var postObject = __docs[x].toObject();
                                        if (!postObject.hasOwnProperty('title')) {
                                            postObject.title = 'Untitled Report';
                                        }

                                        if (!postObject.hasOwnProperty('media')) {
                                            postObject.media = 'no-media.jpg';
                                        }
                                        for (y = 0; y < postObject.comments.length; y++) {
                                            if (!postObject.comments[y].users._id.hasOwnProperty('media')) {
                                                postObject.comments[y].users._id.media = 'no-media.jpg';
                                            }
                                        }
                                        objArray.push(postObject);
                                    }
                                    var body = {
                                        "status": 1,
                                        "data": objArray,
                                        "nextToken": newToken
                                    };
                                    res.status(200).send(body);
                                });

                            });

                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;
            case 'report/get':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        Post.findOne({_id: req.body._id})
                        .populate({path: 'users._id', select: 'name media'})
                        .populate({path: 'media._ids', select: 'directory'})
                        .populate({path: 'categories._id', select: 'name'})
                        .populate({path: 'comments.users._id', select: 'name media'})
                        .populate({path: 'statuses.steps._id', select: 'name'})
                        .populate({path: 'organizations._id', select: 'name'})
                        .then(function (doc) {
                            if (doc !== null) {
                                var Media = Collection['media'];
                                Media.populate(doc, {
                                    path: 'users._id.media._id',
                                    select: 'directory',
                                }, function (err, _doc) {
                                    Media.populate(_doc, {
                                        path: 'comments.users._id.media._id',
                                        select: 'directory',
                                    }, function (err, __doc) {
                                        var body = {
                                            "status": 1,
                                            "data": __doc,
                                            "nextToken": newToken
                                        };
                                        res.status(200).send(body);
                                    });
                                });

                            } else {
                                var body = {
                                    "status": 0,
                                    "message": "invalid report id",
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;
            case 'report/create':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        console.log("mamat1");
                        var medias = [];
                        if (req.body.hasOwnProperty('medias')) {
                            console.log("mamat2");
                            medias = JSON.parse(req.body.medias);
                        }
                        console.log("mamat3");
                        var Post = Collection['posts'];
                        var postobj = {
                            text: req.body.text,
                            "users._id": req.loggedUser._id,
                            "organizations._id": publicOrganizationId, // default : PUBLIC organization
                            "media._ids": medias,
                            statuses: [],
                            comments: [],
                            lat: req.body.lat,
                            long: req.body.long
                        };
                        console.log("mamat4");
                        if (req.body.title) postobj.title = req.body.title;
                        var newPost = new Post(postobj);
                        newPost.save().then(function (doc) {
                            console.log("mamat5");
                            var body = {
                                "status": 1,
                                "message": "new report has been posted",
                                "nextToken": newToken
                            };
                            res.status(201).send(body);
                        }).catch(function (e) {
                            console.log("mamat6");
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;
            case 'report/delete':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        Post.findOne({_id: req.body._id, "users._id": req.loggedUser._id}).remove().then(function (doc) {
                            if (doc !== null) {
                                var body = {
                                    "status": 1,
                                    "message": "report has been deleted",
                                    "nextToken": newToken
                                };
                                res.status(200).send(body);
                            } else {
                                var body = {
                                    "status": 0,
                                    "message": "invalid report id",
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;
            case 'comment/create':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        Post.findOne({_id: req.body.parent_id}).then(function (doc) {
                            if (doc !== null) {
                                var newComment = {
                                    text: req.body.text,
                                    "users._id": req.loggedUser._id,
                                };
                                doc.comments.push(newComment);
                                doc.save(function (err) {
                                    if (!err) {
                                        var body = {
                                            "status": 1,
                                            "message": "comment has been posted",
                                            "nextToken": newToken
                                        };
                                        res.status(200).send(body);
                                    } else {
                                        var body = {
                                            "status": 0,
                                            "message": err,
                                            "nextToken": newToken
                                        };
                                        res.status(500).send(body);
                                    }
                                });
                            } else {
                                var body = {
                                    "status": 0,
                                    "message": "invalid report id",
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;
            case 'comment/delete':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Post = Collection['posts'];
                        Post.findOne({_id: req.body.parent_id}).then(function (doc) {
                            if (doc !== null) {
                                var rm = doc.comments.id(req.body._id).remove(); // TODO: cek id dan user pembuatnya juga. jadi cuma si orang yang buat komentar yang bisa ngehapusnya
                                doc.save(function (err) {
                                    if (!err) {
                                        var body = {
                                            "status": 1,
                                            "message": "comment has been removed",
                                            "nextToken": newToken
                                        };
                                        res.status(200).send(body);
                                    } else {
                                        var body = {
                                            "status": 0,
                                            "message": err,
                                            "nextToken": newToken
                                        };
                                        res.status(500).send(body);
                                    }
                                });
                            } else {
                                var body = {
                                    "status": 0,
                                    "message": "invalid report id",
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;
            case 'user/get':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var User = Collection['users'];
                        User.findOne({_id: req.body._id}).select('-password').then(function (doc) {
                            if (doc !== null) {
                                var body = {
                                    "status": 1,
                                    "data": doc,
                                    "nextToken": newToken
                                };
                                res.status(200).send(body);
                            } else {
                                var body = {
                                    "status": 0,
                                    "message": "invalid user id",
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;
            case 'user/update':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var User = Collection['users'];
                        User.findOne({_id: req.loggedUser._id}).then(function (doc) {
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
                                if (req.body.avatar) doc.media._id = req.body.avatar;
                                doc.save(function (err) {
                                    if (!err) {
                                        var body = {
                                            "status": 1,
                                            "message": "user data has been updated",
                                            "nextToken": newToken
                                        };
                                        res.status(200).send(body);
                                    } else {
                                        var body = {
                                            "status": 0,
                                            "message": err,
                                            "nextToken": newToken
                                        };
                                        res.status(500).send(body);
                                    }
                                });
                            } else {
                                var body = {
                                    "status": 0,
                                    "message": "invalid user id",
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;

            case 'user/update/avatar':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {

                        upload(req, res, function (err) {
                            if (err) {
                                var body = {
                                    "status": 0,
                                    "message": 'error uploading file',
                                    "err": err,
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            } else {
                                console.log("req.file :");
                                console.log(req.file);
                                var Media = Collection['media'];
                                var mediaObj = {
                                    type: req.file.mimetype,
                                    directory: req.file.filename,
                                    description: req.body.description || '',
                                    notes: req.body.notes || '',
                                };
                                var newMedia = new Media(mediaObj);
                                newMedia.save().then(function (doc) {
                                    var body = {
                                        "status": 1,
                                        "message": 'new media created',
                                        "mediaid": doc._id,
                                        "nextToken": newToken
                                    };
                                    res.status(200).send(body);
                                }).catch(function (e) {
                                    var body = {
                                        "status": 0,
                                        "message": 'error',
                                        "nextToken": newToken
                                    };
                                    res.status(500).send(body);
                                });
                            }
                        });
                    }
                });
                break;

            case 'organization/get':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Organization = Collection['organizations'];
                        Organization.findOne({_id: req.body._id}).then(function (doc) {
                            if (doc !== null) {
                                var body = {
                                    "status": 1,
                                    "data": doc,
                                    "nextToken": newToken
                                };
                                res.status(200).send(body);
                            } else {
                                var body = {
                                    "status": 0,
                                    "message": "invalid organization id",
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            }
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;

            //// from this point on, for testing purposes only ////
            case 'category/create':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Category = Collection['categories'];
                        var catObj = {
                            name: req.body.name,
                            description: req.body.description,
                            "organizations._id": publicOrganizationId,
                            notes: req.body.notes
                        };
                        var newCat = new Category(catObj);
                        newCat.save().then(function (doc) {
                            var body = {
                                "status": 1,
                                "message": 'new category created',
                                "nextToken": newToken
                            };
                            res.status(200).send(body);
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": 'error',
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;

            case 'role/create':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Role = Collection['roles'];
                        var roleObj = {
                            name: req.body.name,
                            description: req.body.description,
                            "organizations._id": publicOrganizationId,
                            notes: req.body.notes
                        };
                        var newRole = new Role(roleObj);
                        newRole.save().then(function (doc) {
                            var body = {
                                "status": 1,
                                "message": 'new role created',
                                "nextToken": newToken
                            };
                            res.status(200).send(body);
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": 'error',
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;

            case 'procedure/create':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Procedure = Collection['procedures'];
                        var procObj = {
                            name: req.body.name,
                            description: req.body.description,
                            "roles._id": req.body.rolesid,
                            "categories._id": req.body.categoriesid,
                            notes: req.body.notes
                        };
                        var newProcedure = new Procedure(procObj);
                        newProcedure.save().then(function (doc) {
                            var body = {
                                "status": 1,
                                "message": 'new procedure created',
                                "nextToken": newToken
                            };
                            res.status(200).send(body);
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": 'error',
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;

            case 'step/create':
                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {
                        var Step = Collection['steps'];
                        var stepObj = {
                            name: req.body.name,
                            description: req.body.description,
                            stepNumber: req.body.stepNumber,
                            duration: req.body.duration,
                            "procedures._id": req.body.proceduresid,
                            notes: req.body.notes
                        };
                        var newStep = new Step(stepObj);
                        newStep.save().then(function (doc) {
                            var body = {
                                "status": 1,
                                "message": 'new step created',
                                "nextToken": newToken
                            };
                            res.status(200).send(body);
                        }).catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": 'error',
                                "nextToken": newToken
                            };
                            res.status(500).send(body);
                        });
                    }
                });
                break;

            case 'media/create':

                var nextToken = api.refreshToken(req.header('Token'), function (errortoken, newToken) {
                    if (errortoken) {
                        var body = {
                            "status": 0,
                            "message": "failed to get new token. Please login again.",
                        };
                        res.status(500).send(body);
                    } else {

                        upload(req, res, function (err) {
                            if (err) {
                                var body = {
                                    "status": 0,
                                    "message": 'error uploading file',
                                    "err": err,
                                    "nextToken": newToken
                                };
                                res.status(500).send(body);
                            } else {
                                console.log("req.file :");
                                console.log(req.file);
                                var Media = Collection['media'];
                                var mediaObj = {
                                    type: req.file.mimetype,
                                    directory: req.file.filename,
                                    description: req.body.description || '',
                                    notes: req.body.notes || '',
                                };
                                var newMedia = new Media(mediaObj);
                                newMedia.save().then(function (doc) {
                                    var body = {
                                        "status": 1,
                                        "message": 'new media created',
                                        "mediaid": doc._id,
                                        "nextToken": newToken
                                    };
                                    res.status(200).send(body);
                                }).catch(function (e) {
                                    var body = {
                                        "status": 0,
                                        "message": 'error',
                                        "nextToken": newToken
                                    };
                                    res.status(500).send(body);
                                });
                            }
                        });
                    }
                });
                break;

        }
    })
    //
    page.use('/!', api);
    page.use(function (req, res, next) {
        var paths = req._parsedUrl.pathname.split("/").slice(1);
        if (paths[0] == "!" && paths[1]) next();
        else {
            var group = req.logged.user.groups.name.toLowerCase().replace(/\s/g, "");
            if (group !== namescape) next(group)
            else next();
        }
    });
    page.get('/', function (req, res, next) {
        locals.www = {
            name: global.name,
            description: global.description,
            activePage: req.url, //todo : buat apa lih?
            version: global.version
        };
        res.render(namescape, locals.www);
    });

    return page;
};