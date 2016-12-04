var namescape = "admin";
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
        
        // all incoming reports to an admin

        Post.find({ 
            "organizations._id" : req.logged.user.organizations._id, 
            active: true,
            "assignTo.users._id" : req.logged.user._id
        }, 'text lat long').then(function(doc){
            data.allreportltlng = doc;

            // returned reports
            Post.find({
                $and: [
                    { "organizations._id" : req.logged.user.organizations._id },
                    { active: true },
                    { "assignTo.users._id" : req.logged.user._id },
                    { returned: { $exists: true } }
                ]
            }, 'text lat long').then(function(doc4){
                data.returnedreportltlng = doc4;

                // finished reports
                Post.find({
                    $and: [
                        { "organizations._id" : req.logged.user.organizations._id },
                        { active: true },
                        { "assignTo.users._id" : req.logged.user._id },
                        { finished: true }
                    ]
                }, 'text lat long').then(function(doc4){
                    data.finishedreportltlng = doc4;
                    var orgid = mongoose.Types.ObjectId(req.logged.user.organizations._id);
                    var adminid = mongoose.Types.ObjectId(req.logged.user._id);
                    var currentYear = new Date();
                    // TODO: monthly reports
                    Post.aggregate([
                        { 
                            $match : { 
                                $and: [
                                    { active: true },
                                    { "organizations._id" : orgid },
                                    { "assignTo.users._id" : adminid },
                                ] 
                            } 
                        }, 
                        {
                            $group: {
                                _id:  { year: { $year: currentYear }, month: { $month: "$createdAt" } },
                                sum: {$sum: 1}
                            }
                        }   
                    ])
                    .then(function(doc5){
                        var aggData = [];
                        // before injecting the data, set other month values with 0

                        // loop through months
                        for(m=1; m<=12; m++){
                            var monthExist = doc5.filter(function( obj ) {
                                return obj._id.month == m;
                            });
                            if(monthExist.length === 0){
                                aggData.push({
                                    _id: {
                                        month: m,
                                        year: currentYear.getFullYear()
                                    },
                                    sum: 0
                                });
                            } else {
                                aggData.push(monthExist[0]);
                            }
                        }
                        data.monthlyreports = aggData;

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
    });

    api.get('/allrolesandcategories', function(req, res, next){
        var Role = Collection['roles'];
        var Category = Collection['categories'];
        Role.find({ "organizations._id": req.logged.user.organizations._id })
        .then(function(docs){
            Category.find({ "organizations._id": req.logged.user.organizations._id })
            .then(function(docs2){
                var body = {
                    "status" : 1,
                    "roledata" : docs,
                    "categorydata" : docs2
                };
                res.status(200).send(body);
            }).catch(function(e){
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
        Post.find({
            "organizations._id" : req.logged.user.organizations._id, 
            "assignTo.users._id" : req.logged.user._id 
        }, 'title text users._id createdAt media._ids')
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
        Post.findOne({ 
            "organizations._id" : req.logged.user.organizations._id, 
            _id: postid, 
            "assignTo.users._id" : req.logged.user._id
        })
        .populate({ path: 'users._id', select: 'name' }).populate({ path: 'media._ids', select: 'directory type' })
        .populate({ path: 'statuses.steps._id', select: 'procedures._id name' })
        .then(function(doc){
            if(doc.statuses.length>0){
                var Step = Collection['steps'];
                Step.find({
                    "procedures._id": doc.statuses[0].steps._id.procedures._id
                })
                .populate({ path: 'procedures._id', select: 'name' })
                .sort({ stepNumber: 1 })
                .then(function(doc2){
                    var body = {
                        "status" : 1,
                        "data" : doc,
                        "steps" : doc2
                    };
                    res.status(200).send(body);   
                })
                .catch(function(e){
                    console.log('error at step query');
                    console.log(e);
                    var body = {
                        "status" : 0,
                        "message" : e,
                    };
                    res.status(500).send(body);
                });
            } else {
                var body = {
                    "status" : 1,
                    "data" : doc,
                    "steps" : []
                };
                res.status(200).send(body);   
            }
        })
        .catch(function(e){
            console.log('error at post query');
            console.log(e);
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/monthlyreports', function(req, res, next){
        var currentYear = new Date().getFullYear();
        var m = parseInt(req.param('m'));
        var Post = Collection['posts'];
        var query = {
            "organizations._id" : req.logged.user.organizations._id, 
            active: true,
            "assignTo.users._id" : req.logged.user._id,
            "createdAt": {"$gte": new Date(Date.UTC(currentYear, m, 1, 0, 0, 0)), "$lt": new Date(Date.UTC(currentYear, (m+1), 1, 0, 0, 0))}
        };
        Post.find(query)
        .populate({ path: 'users._id', select: 'name' })
        .then(function(docs){
            var body = {
                "status" : 1,
                "data" : docs,
                "query": query
            };
            res.status(200).send(body);
        }).catch(function(e){
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });

    api.post('/markreturn', function(req, res, next){
        var postid = req.body.postid;
        var reason = req.body.reason;
        var Post = Collection['posts'];
        Post.findOne({ 
            _id: postid, 
            "organizations._id": req.logged.user.organizations._id, 
            active: true, 
            "assignTo.users._id" : req.logged.user._id })
        .then(function(doc){
            doc.returned.reason = reason;
            doc.returned.createdAt = new Date();
            doc.save()
            .then(function(doc){
                var body = {
                    "status" : 1,
                    "message" : "report has been marked as return",
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
            active: true,
            "assignTo.users._id" : req.logged.user._id
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
    
    api.get('/reportcountbycategory', function(req, res, next) {
        var datatype = req.param('type');
        var orgid = mongoose.Types.ObjectId(req.logged.user.organizations._id);
        var adminid = mongoose.Types.ObjectId(req.logged.user._id); 
        var Post = Collection['posts'];
        var queryMatch = {};
        switch (datatype){
            case "1":
                queryMatch = { 
                    $and: [
                        { active: true },
                        { "organizations._id" : orgid },
                        { "assignTo.users._id" : adminid }
                    ] 
                };
                break;
            case "2":
                queryMatch = { 
                    $and: [
                        { "organizations._id" : orgid },
                        { active: true },
                        { "assignTo.users._id" : adminid },
                        { returned: { $exists: false } },
                        { rejected: { $exists: false } }
                    ] 
                };
                break;
            case "3":
                queryMatch = { 
                    $and: [
                        { "organizations._id" : orgid },
                        { active: true },
                        { "assignTo.users._id" : adminid },
                        { finished: true }
                    ] 
                };
                break;
        }
        Post.aggregate([
            { 
                $match :  queryMatch
            }, 
            {
                $group: {
                    _id:  '$categories._id',
                    sum: {$sum: 1}
                }
            },
            { 
                $lookup: {
                    "from": "categories",
                    "localField": "_id",
                    "foreignField": "_id",
                    "as": "category"
                }
            },
        ]).then(function(doc){
            var body = {
                "status" : 1,
                "data" : doc,
            };
            res.status(200).send(body);
        }).catch(function(e){
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
                {active: true, "assignTo.users._id" : req.logged.user._id },
                { "assignTo.implementor" : { $exists: false } },
                { returned: { $exists: false } },
                { rejected: { $exists: false } }
            ]

        }).then(function(num){
            var minSkip = 0;
            var maxSkip = num; // TODO: buat skema di mana antara satu moderator dengan moderator lainnya gak akan buka laporan yang sama (untuk disposisi)
            var randomSkip = Math.floor(Math.random() * (maxSkip - minSkip)) + minSkip;
            Post.find({ 
                $and: [
                    { "organizations._id" : req.logged.user.organizations._id, "posts._id" : { $exists: false } },
                    {active: true, "assignTo.users._id" : req.logged.user._id },
                    { "assignTo.implementor" : { $exists: false } },
                    { returned: { $exists: false } },
                    { rejected: { $exists: false } }
                ]
            }).populate({ path: 'users._id', select: 'name' }).populate({ path: 'media._ids', select: 'directory type' }).skip(randomSkip).limit(1)
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
    
    api.get('/sop', function(req, res, next){
        var Post = Collection['posts'];
        var postid = req.param('postid');
        
        Post.findOne({
            "organizations._id" : req.logged.user.organizations._id, 
            active: true,
            "assignTo.users._id" : req.logged.user._id,
            _id : postid
        }).then(function(doc){
            var Procedure = Collection['procedures'];
            Procedure.find({
                "roles._id" : req.logged.user.roles._id,
                "categories._id" : doc.categories._id
            }).then(function(docs){
                var User = Collection['users'];
                User.find({
                    "organizations._id" : req.logged.user.organizations._id, 
                    active: true,
                    "roles._id" : req.logged.user.roles._id,
                    "groups._id" : "580a24727709cb078b9fe17a" // this is implementor group ID. TODO: buat reference
                }).then(function(docs2){
                    var body = {
                        "status" : 1,
                        "sopdata" : docs,
                        "implementordata" : docs2
                    };
                    res.status(200).send(body);
                }).catch(function(e){
                    console.log('error at user query');
                    var body = {
                        "status" : 0,
                        "message" : e,
                    };
                    res.status(500).send(body); 
                });
                
            }).catch(function(e){
                console.log('error at procedure query');
                var body = {
                    "status" : 0,
                    "message" : e,
                };
                res.status(500).send(body); 
            });
        }).catch(function(e){
            console.log('error at post query');
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });
    
    api.post('/assignsop', function(req, res, next){
        var postid = req.body.postid;
        var userid = req.body.userid;
        var sopid = req.body.sopid;
        console.log('sopid:');
        console.log(sopid);
        var Post = Collection['posts'];
        Post.findOne({
            "organizations._id" : req.logged.user.organizations._id, 
            active: true,
            _id : postid
        }).then(function(doc){
            var Step = Collection['steps'];
            Step.find({
                "procedures._id": sopid
            })
            .sort({ stepNumber: 1 })
            .then(function(docs2){
                console.log(docs2);
                ///////////////////
                var newSteps = {
                    "users._id" : userid,
                    "steps._id" :   docs2[0]._id
                };
                doc.assignTo.implementor.users._id = userid;
                doc.assignTo.implementor.createdAt = new Date();
                doc.statuses.push(newSteps);
                doc.save().then(function(result){
                    var body = {
                        "status" : 1,
                        "message" : "Post has been assigned to an SOP",
                    };
                    res.status(200).send(body);
                }).catch(function(e){
                    console.log('error at update post query');
                    console.log(e);
                    var body = {
                        "status" : 0,
                        "message" : e,
                    };
                    res.status(500).send(body);
                });
                /////////////////
            })
            .catch(function(e){
                console.log('error at steps query');
                console.log(e);
                var body = {
                    "status" : 0,
                    "message" : e,
                };
                res.status(500).send(body);
            });
        }).catch(function(e){
            console.log('error at post query');
            console.log(e);
            var body = {
                "status" : 0,
                "message" : e,
            };
            res.status(500).send(body);
        });
    });
    //
    page.use(function(req, res, next){
        var group = req.logged.user.groups.name.toLowerCase().replace(/\s/g, "");
        if (group !== namescape) next(group)
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