var namescape = "moderator";
var page = require('express').Router();
var api = require('express').Router();
var httpCode = require('http').STATUS_CODES;
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
    //

    api.get('/alldashboarddata', function(req, res, next){
        var Post = Collection['posts'];
        var data = {};
        var finalfunc = function(){
            var body = {
                "status" : 1,
                "data" : data,
            };
            res.status(200).send(body);
        }
        var errfunc = function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        }

        // TODO: kodenya masih kotor banget. next-nya bersihin pake modul apa kek biar parallel jadi gak terus2an menjorok.
        
        // all reports

        Post.find({ "organizations._id" : req.logged.user.organizations._id, active: true }, 'text lat long').then(function(doc){
            data.allreportltlng = doc;

            // unassigned reports
            Post.find({ 
                $and: [
                    { "organizations._id" : req.logged.user.organizations._id, "posts._id" : { $exists: false } },
                    {active: true, "assignTo.users._id" : { $exists: false }},
                    { $or: [{returned: false}, {returned: { $exists: false }}] },
                    { $or: [{rejected: false}, {rejected: { $exists: false }}] }
                ]
            }, 'text lat long').then(function(doc2){
                data.unassignedreportltlng = doc2;

                // assigned reports
                Post.find({
                    $and: [
                        { "organizations._id" : req.logged.user.organizations._id},
                        {active: true, "assignTo.users._id" : { $exists: true }},
                        { $or: [{returned: false}, {returned: { $exists: false }}] },
                        { $or: [{rejected: false}, {rejected: { $exists: false }}] }
                    ]
                }, 'text lat long').then(function(doc3){
                    data.assignedreportltlng = doc3;

                    // returned reports
                    Post.find({
                        $and: [
                            { "organizations._id" : req.logged.user.organizations._id },
                            { active: true },
                            { returned: true },
                            { $or: [{rejected: false}, {rejected: { $exists: false }}] }
                        ]
                    }, 'text lat long').then(function(doc4){
                        data.returnedreportltlng = doc4;

                        // rejected reports
                        Post.find({
                            $and: [
                                { "organizations._id" : req.logged.user.organizations._id },
                                { active: true },
                                { $or: [{returned: false}, {returned: { $exists: false }}] },
                                { rejected: true }
                            ]
                        }, 'text lat long').then(function(doc4){
                            data.rejectedreportltlng = doc4;

                            // monthly reports
                            finalfunc();
                            
                        
                        }).catch(function(e){
                            errfunc(e);
                        });
                    
                    }).catch(function(e){
                        errfunc(e);
                    });
                
                }).catch(function(e){
                    errfunc(e);
                });

            }).catch(function(e){
                errfunc(e);
            });

        }).catch(function(e){
            errfunc(e);
        });
    });

    api.get('/allroles', function(req, res, next){
        var Role = Collection['roles'];

        Role.find({ "organizations._id": req.logged.user.organizations._id })
        .then(function(docs){
            var body = {
                "status" : 1,
                "data" : docs,
            };
            res.status(200).send(body);
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/alladminroles', function(req, res, next){
        var roleid = req.param('roleid');
        console.log(roleid);
        var User = Collection['users'];
        User.find({ 
            $and: [
                { "organizations._id" : req.logged.user.organizations._id },
                { "roles._id" : { $exists: true} },
                { "roles._id" : roleid }
            ]
        })
        .then(function(docs){
            var body = {
                "status" : 1,
                "data" : docs,
            };
            res.status(200).send(body);
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });    

    api.get('/allreports', function(req, res, next){
        var Post = Collection['posts'];
        Post.find({ "organizations._id" : req.logged.user.organizations._id }, 'title text users._id createdAt media._ids')
        .populate({ path: 'users._id', select: 'name' })
        .then(function(docs){
            var body = {
                "status" : 1,
                "data" : docs,
            };
            res.status(200).send(body);
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/reportdetail', function(req, res, next){
        var postid = req.param('postid');
        var Post = Collection['posts'];
        Post.findOne({ "organizations._id" : req.logged.user.organizations._id, _id: postid })
        .then(function(doc){
            var body = {
                "status" : 1,
                "data" : doc,
            };
            res.status(200).send(body);
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/nextreport', function(req, res, next){
        var Post = Collection['posts'];
        Post.count({ 
            $and: [
                { "organizations._id" : req.logged.user.organizations._id, "posts._id" : { $exists: false } },
                {active: true, "assignTo.users._id" : { $exists: false }},
                { $or: [{returned: false}, {returned: { $exists: false }}] },
                { $or: [{rejected: false}, {rejected: { $exists: false }}] }
            ]

        }).then(function(num){
            var minSkip = 0;
            var maxSkip = num; // TODO: buat skema di mana antara satu moderator dengan moderator lainnya gak akan buka laporan yang sama (untuk disposisi)
            var randomSkip = Math.floor(Math.random() * (maxSkip - minSkip)) + minSkip;
            Post.find({ 
                $and: [
                    { "organizations._id" : req.logged.user.organizations._id, "posts._id" : { $exists: false } },
                    {active: true, "assignTo.users._id" : { $exists: false }},
                    { $or: [{returned: false}, {returned: { $exists: false }}] },
                    { $or: [{rejected: false}, {rejected: { $exists: false }}] }
                ]
            }).populate({ path: 'users._id', select: 'name' }).skip(randomSkip).limit(1)
            .then(function(doc){
                var body = {
                    "status" : 1,
                    "data" : doc,
                };
                res.status(200).send(body);
            })
            .catch(function(e){
                var body = {
                    "status" : 0,
                    "message" : e,
                };
                res.status(500).send(body);
            });
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });

    api.post('/assign', function(req, res, next){
        var User = Collection['users'];
        var postid = req.body.postid;
        var userid = req.body.userid;
        // cek benarkah user ini di organisasi ini dengan role ini
        User.findOne({ _id: userid, "organizations._id": req.logged.user.organizations._id })
        .then(function(doc){
            if(doc!==null){
                var Post = Collection['posts'];
                Post.findOne({ _id: postid})
                .then(function(doc2){
                    if(doc2!==null){
                        doc2.assignTo.users._id = userid;
                        doc2.save()
                        .then(function(result){
                            var body = {
                                "status" : 1,
                                "message" : "post has been assigned",
                            };
                            res.status(200).send(body);
                        })
                        .catch(function(e){
                            var body = {
                                "status" : 0,
                                "message" : e,
                            };
                            res.status(500).send(body);
                        });
                    } else {
                        var body = {
                            "status" : 0,
                            "message" : "post not found",
                        };
                        res.status(500).send(body);
                    }
                })
                .catch(function(e){
                    var body = {
                        "status" : 0,
                        "message" : e,
                    };
                    res.status(500).send(body);
                });
            } else {
                var body = {
                    "status" : 0,
                    "message" : "user not found",
                };
                res.status(500).send(body);
            }
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
        
    });

    api.post('/markduplicate', function(req, res, next){
        var postid = req.body.postid;
        var duplicateid = req.body.duplicateid;

        var Post = Collection['posts'];
        Post.findOne({ _id: postid, "organizations._id": req.logged.user.organizations._id, active: true })
        .then(function(doc){
            doc.posts._id = duplicateid;
            doc.save()
            .then(function(doc){
                var body = {
                    "status" : 1,
                    "message" : "report has been marked as duplicate",
                };
                res.status(200).send(body);
            })
            .catch(function(e){
                var body = {
                    "status" : 0,
                    "message" : e,
                };
                res.status(500).send(body);
            });
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });

    api.post('/markreject', function(req, res, next){
        var postid = req.body.postid;
        var reasonText = req.body.reason;

        var Post = Collection['posts'];
        Post.findOne({ _id: postid, "organizations._id": req.logged.user.organizations._id, active: true })
        .then(function(doc){
            doc.rejected = true;
            doc.notes = reasonText;
            doc.save()
            .then(function(doc){
                var body = {
                    "status" : 1,
                    "message" : "report has been marked as rejected",
                };
                res.status(200).send(body);
            })
            .catch(function(e){
                var body = {
                    "status" : 0,
                    "message" : e,
                };
                res.status(500).send(body);
            });
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/timeline', function(req, res, next){
        var start = parseInt(req.param('start'));
        var limit = parseInt(req.param('limit'));

        var Post = Collection['posts'];
        Post.find({
            "organizations._id": req.logged.user.organizations._id,
            active: true
        }).populate({ path: 'users._id', select: 'name' }).skip(start).limit(limit)
        .populate({ path: 'media._ids', select: 'type directory' })
        .then(function(docs){
            var body = {
                "status" : 1,
                "data" : docs,
            };
            res.status(200).send(body);
        })
        .catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });



    page.use(function(req, res, next){
        var group = req.logged.user.groups.name.toLowerCase().replace(/\s/g, "");
        if (group !== namescape) next(group);
        else next();
    });
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
