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
                    { "organizations._id" : req.logged.user.organizations._id},
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

    api.get('/monthlyreportcount', function(req, res, next){

    });


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