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

    api.get('/alldashboarddata', function (req, res, next) {
        var Post = Collection['posts'];
        var Organization = Collection['organizations'];
        var data = {};
        var finalfunc = function () {
            var body = {
                "status": 1,
                "data": data,
            };
            res.status(200).send(body);
        }
        var errfunc = function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(200).send(body);
        }
        
        // get organizagtion latlong
        Organization.findOne({
            "_id": req.logged.user.organizations._id
        }).then(function(doc){
            data.orglocationlat = doc.location.lat;
            data.orglocationlong = doc.location.long;
        }).catch(function(e){
            errfunc(e);
        });

        // TODO: kodenya masih kotor banget. next-nya bersihin pake modul apa kek biar parallel jadi gak terus2an menjorok.

        // all reports
        Post.find({
            "organizations._id": req.logged.user.organizations._id,
            active: true
        }, 'text lat long')
        .then(function (doc) {
            data.allreportltlng = doc;

            // unassigned reports
            Post.find({
                $and: [
                    {"organizations._id": req.logged.user.organizations._id, "posts._id": {$exists: false}},
                    {active: true, "assignTo.roles._id": {$exists: false}},
                    {returned: {$exists: false}},
                    {rejected: {$exists: false}}
                ]
            }, 'text lat long').then(function (doc2) {
                data.unassignedreportltlng = doc2;

                // assigned reports
                Post.find({
                    $and: [
                        {"organizations._id": req.logged.user.organizations._id},
                        {active: true, "assignTo.roles._id": {$exists: true}},
                        {returned: {$exists: false}},
                        {rejected: {$exists: false}}
                    ]
                }, 'text lat long').then(function (doc3) {
                    data.assignedreportltlng = doc3;

                    // returned reports
                    Post.find({
                        $and: [
                            {"organizations._id": req.logged.user.organizations._id},
                            {active: true},
                            {returned: {$exists: true}},
                            {rejected: {$exists: false}}
                        ]
                    }, 'text lat long').then(function (doc4) {
                        data.returnedreportltlng = doc4;

                        // rejected reports
                        Post.find({
                            $and: [
                                {"organizations._id": req.logged.user.organizations._id},
                                {active: true},
                                {returned: {$exists: false}},
                                {rejected: {$exists: true}}
                            ]
                        }, 'text lat long').then(function (doc4) {
                            data.rejectedreportltlng = doc4;
                            var orgid = mongoose.Types.ObjectId(req.logged.user.organizations._id);
                            var currentYear = new Date();

                            Post.aggregate([
                                {
                                    $match: {
                                        $and: [
                                            {active: true},
                                            {"organizations._id": orgid}
                                        ]
                                    }
                                },
                                {
                                    $group: {
                                        _id: {year: {$year: currentYear}, month: {$month: "$createdAt"}},
                                        sum: {$sum: 1}
                                    }
                                }
                            ])
                            .then(function (doc5) {
                                var aggData = [];
                                // before injecting the data, set other month values with 0

                                // loop through months
                                for (m = 1; m <= 12; m++) {
                                    var monthExist = doc5.filter(function (obj) {
                                        return obj._id.month == m;
                                    });
                                    if (monthExist.length === 0) {
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

                            }).catch(function (e) {
                                errfunc(e);
                            });

                        }).catch(function (e) {
                            errfunc(e);
                        });

                    }).catch(function (e) {
                        errfunc(e);
                    });

                }).catch(function (e) {
                    errfunc(e);
                });

            }).catch(function (e) {
                errfunc(e);
            });

        }).catch(function (e) {
            errfunc(e);
        });
    });

    api.get('/allrolesandcategories', function (req, res, next) {
        var Role = Collection['roles'];
        var Category = Collection['categories'];
        Role.find({"organizations._id": req.logged.user.organizations._id})
        .then(function (docs) {
            Category.find({"organizations._id": req.logged.user.organizations._id})
            .then(function (docs2) {
                var body = {
                    "status": 1,
                    "roledata": docs,
                    "categorydata": docs2
                };
                res.status(200).send(body);
            }).catch(function (e) {
                var body = {
                    "status": 0,
                    "message": e,
                };
                res.status(500).send(body);
            });
        })
        .catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/alladminroles', function (req, res, next) {
        var roleid = req.param('roleid');
        console.log(roleid);
        var User = Collection['users'];
        User.find({
            $and: [
                {"organizations._id": req.logged.user.organizations._id},
                {"roles._id": {$exists: true}},
                {"roles._id": roleid},
                {"groups._id": "580a24727709cb078b9fe179"} // this is "Admin" group id. // TODO: set a reference
            ]
        })
        .then(function (docs) {
            var body = {
                "status": 1,
                "data": docs,
            };
            res.status(200).send(body);
        })
        .catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/allreports', function (req, res, next) {
        var Post = Collection['posts'];
        Post.find({
            "organizations._id": req.logged.user.organizations._id,
            active: true
        })
        .populate({path: 'users._id', select: 'name'})
        .then(function (docs) {
            var projectedDocs = [];
            for(var i=0; i<docs.length; i++){
                var plainObj = docs[i].toObject();
                var docObj = {};
                docObj._id = plainObj._id;
                docObj.title = plainObj.title || "Untitled Report";
                docObj.text = plainObj.text;
                docObj.users = plainObj.users;
                docObj.createdAt = plainObj.createdAt;
                
                if((plainObj.hasOwnProperty('static')) && (plainObj.static === true)){
                    docObj.status = "non-report";
                } else if((plainObj.hasOwnProperty('finished')) && (plainObj.finished === true)){
                    docObj.status = "Finished";
                } else {
                    if(plainObj.hasOwnProperty('rejected')){
                        docObj.status = "Rejected";
                    } else if (plainObj.hasOwnProperty('returned')){
                        docObj.status = "Returned";
                    } else if(plainObj.hasOwnProperty('assignTo')){
                        docObj.status = "On Progress";
                    } else {
                        docObj.status = "Pending";
                    }
                }
                projectedDocs.push(docObj);
            }
            var body = {
                "status": 1,
                "data": projectedDocs,
            };
            res.status(200).send(body);
        })
        .catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/reportdetail', function (req, res, next) {
        var postid = req.param('postid');
        var Post = Collection['posts'];
        Post.findOne({
            "organizations._id": req.logged.user.organizations._id,
            _id: postid,
            active: true
        })
        .populate({path: 'users._id', select: 'name'}).populate({path: 'media._ids', select: 'directory type'})
        .populate({path: 'statuses.steps._id', select: 'procedures._id name'})
        .then(function (doc) {
            if (doc.statuses.length > 0) {
                var Step = Collection['steps'];
                Step.find({
                    "procedures._id": doc.statuses[0].steps._id.procedures._id,
                    active: true
                })
                .populate({path: 'procedures._id', select: 'name'})
                .sort({stepNumber: 1})
                .then(function (doc2) {
                    var body = {
                        "status": 1,
                        "data": doc,
                        "steps": doc2
                    };
                    res.status(200).send(body);
                })
                .catch(function (e) {
                    console.log('error at step query');
                    console.log(e);
                    var body = {
                        "status": 0,
                        "message": e,
                    };
                    res.status(500).send(body);
                });
            } else {
                var body = {
                    "status": 1,
                    "data": doc,
                    "steps": []
                };
                res.status(200).send(body);
            }
        })
        .catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/monthlyreports', function (req, res, next) {
        var currentYear = new Date().getFullYear();
        var m = parseInt(req.param('m'));
        var Post = Collection['posts'];
        var query = {
            "organizations._id": req.logged.user.organizations._id,
            active: true,
            "createdAt": {"$gte": new Date(Date.UTC(currentYear, m, 1, 0, 0, 0)), "$lt": new Date(Date.UTC(currentYear, (m + 1), 1, 0, 0, 0))}
        };
        Post.find(query)
        .populate({path: 'users._id', select: 'name'})
        .then(function (docs) {
            var body = {
                "status": 1,
                "data": docs,
                "query": query
            };
            res.status(200).send(body);
        }).catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/nextreport', function (req, res, next) {
        var Post = Collection['posts'];
        Post.count({
            $or: [
                {
                    $and: [
                        {"organizations._id": req.logged.user.organizations._id, "posts._id": {$exists: false}},
                        {active: true, "assignTo.roles._id": {$exists: false}},
                        {returned: {$exists: false}},
                        {rejected: {$exists: false}}
                    ]
                },
                {
                    $and: [
                        {"organizations._id": req.logged.user.organizations._id, "posts._id": {$exists: false}},
                        {active: true, "assignTo.roles._id": {$exists: true}},
                        {returned: {$exists: true}},
                        {rejected: {$exists: false}}
                    ]
                }
            ]

        }).then(function (num) {
            var minSkip = 0;
            var maxSkip = num; // TODO: buat skema di mana antara satu moderator dengan moderator lainnya gak akan buka laporan yang sama (untuk disposisi)
            var randomSkip = Math.floor(Math.random() * (maxSkip - minSkip)) + minSkip;
            Post.find({
                $or: [
                    {
                        $and: [
                            {"organizations._id": req.logged.user.organizations._id, "posts._id": {$exists: false}},
                            {active: true, "assignTo.roles._id": {$exists: false}},
                            {returned: {$exists: false}},
                            {rejected: {$exists: false}}
                        ]
                    },
                    {
                        $and: [
                            {"organizations._id": req.logged.user.organizations._id, "posts._id": {$exists: false}},
                            {active: true, "assignTo.roles._id": {$exists: true}},
                            {returned: {$exists: true}},
                            {rejected: {$exists: false}}
                        ]
                    }
                ]
            }).populate({path: 'users._id', select: 'name'}).populate({path: 'media._ids', select: 'directory type'}).skip(randomSkip).limit(1)
            .then(function (doc) {
                var body = {
                    "status": 1,
                    "data": doc,
                };
                res.status(200).send(body);
            })
            .catch(function (e) {
                var body = {
                    "status": 0,
                    "message": e,
                };
                res.status(500).send(body);
            });
        })
        .catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    });

    api.post('/assign', function (req, res, next) {
        var Role = Collection['roles'];
        var postid = req.body.postid;
        var roleid = req.body.roleid;
        var categoryid = req.body.categoryid;
        // cek benarkah role ini di organisasi ini dengan role ini
        Role.findOne({_id: roleid, "organizations._id": req.logged.user.organizations._id})
        .then(function (doc) {
            if (doc !== null) {
                var Post = Collection['posts'];
                Post.findOne({_id: postid})
                .then(function (doc2) {
                    if (doc2 !== null) {
                        doc2.assignFrom.users._id = req.logged.user._id;
                        doc2.assignFrom.createdAt = new Date();
                        doc2.assignTo.roles._id = roleid;
                        doc2.assignTo.createdAt = new Date();
                        doc2.categories._id = categoryid;
                        doc2.returned = undefined;
                        doc2.save()
                        .then(function (result) {
                            var body = {
                                "status": 1,
                                "message": "post has been assigned",
                            };
                            res.status(200).send(body);
                        })
                        .catch(function (e) {
                            var body = {
                                "status": 0,
                                "message": e,
                            };
                            res.status(500).send(body);
                        });
                    } else {
                        var body = {
                            "status": 0,
                            "message": "post not found",
                        };
                        res.status(500).send(body);
                    }
                })
                .catch(function (e) {
                    var body = {
                        "status": 0,
                        "message": e,
                    };
                    res.status(500).send(body);
                });
            } else {
                var body = {
                    "status": 0,
                    "message": "user not found",
                };
                res.status(500).send(body);
            }
        })
        .catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });

    });

    api.post('/markduplicate', function (req, res, next) {
        var postid = req.body.postid;
        var duplicateid = req.body.duplicateid;

        var Post = Collection['posts'];
        Post.findOne({_id: postid, "organizations._id": req.logged.user.organizations._id, active: true})
        .then(function (doc) {
            doc.posts._id = duplicateid;
            doc.posts.users._id = req.logged.user._id;
            doc.save()
            .then(function (doc) {
                var body = {
                    "status": 1,
                    "message": "report has been marked as duplicate",
                };
                res.status(200).send(body);
            })
            .catch(function (e) {
                var body = {
                    "status": 0,
                    "message": e,
                };
                res.status(500).send(body);
            });
        })
        .catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    });

    api.post('/markreject', function (req, res, next) {
        var postid = req.body.postid;
        var reason = req.body.reason;

        if (reason.length < 10) {
            var body = {
                "status": 0,
                "message": "reason must be 10 characters minimum",
            };
            res.status(500).send(body);
        } else {
            var Post = Collection['posts'];
            Post.findOne({_id: postid, "organizations._id": req.logged.user.organizations._id, active: true})
            .then(function (doc) {
                doc.rejected.users._id = req.logged.user._id;
                doc.rejected.reason = reason;
                doc.rejected.createdAt = new Date();
                doc.save()
                .then(function (doc) {
                    var body = {
                        "status": 1,
                        "message": "report has been marked as rejected",
                    };
                    res.status(200).send(body);
                })
                .catch(function (e) {
                    var body = {
                        "status": 0,
                        "message": e,
                    };
                    res.status(500).send(body);
                });
            })
            .catch(function (e) {
                var body = {
                    "status": 0,
                    "message": e,
                };
                res.status(500).send(body);
            });
        }

    });

    api.get('/timeline', function (req, res, next) {
        var start = parseInt(req.param('start'));
        var limit = parseInt(req.param('limit'));

        var Post = Collection['posts'];
        Post.find({
            "organizations._id": req.logged.user.organizations._id,
            active: true
        }).populate({path: 'users._id', select: 'name'}).skip(start).limit(limit)
        .populate({path: 'media._ids', select: 'type directory'})
        .then(function (docs) {
            var body = {
                "status": 1,
                "data": docs,
            };
            res.status(200).send(body);
        })
        .catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    });

    api.get('/reportcountbycategory', function (req, res, next) {
        var datatype = req.param('type');
        var orgid = mongoose.Types.ObjectId(req.logged.user.organizations._id);
        var Post = Collection['posts'];
        var queryMatch = {};
        switch (datatype) {
            case "1":
                queryMatch = {
                    $and: [
                        {active: true},
                        {"organizations._id": orgid}
                    ]
                };
                break;
            case "2":
                queryMatch = {
                    $and: [
                        {"organizations._id": orgid},
                        {active: true},
                        {"assignTo.roles._id": {$exists: true}},
                        {returned: {$exists: false}},
                        {rejected: {$exists: false}}
                    ]
                };
                break;
            case "3":
                queryMatch = {
                    $and: [
                        {"organizations._id": orgid},
                        {active: true},
                        {returned: {$exists: true}},
                        {rejected: {$exists: false}}
                    ]
                };
                break;
            case "4":
                queryMatch = {
                    $and: [
                        {"organizations._id": orgid},
                        {active: true},
                        {returned: {$exists: false}},
                        {rejected: {$exists: true}}
                    ]
                };
                break;
        }
        Post.aggregate([
            {
                $match: queryMatch
            },
            {
                $group: {
                    _id: '$categories._id',
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
        ]).then(function (doc) {
            var body = {
                "status": 1,
                "data": doc,
            };
            res.status(200).send(body);
        }).catch(function (e) {
            var body = {
                "status": 0,
                "message": e,
            };
            res.status(500).send(body);
        });
    })

    page.use(function (req, res, next) {
        var group = req.logged.user.groups.name.toLowerCase().replace(/\s/g, "");
        if (group !== namescape) next(group);
        else next();
    });
    page.use('/!', api);
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
