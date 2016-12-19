api.get('/groups', function (req, res, next) {
    var collname = 'groups';
    var limit = Number(req.query.limit) || maxLimit;
    var page = Number(req.query.page) || 1;
    var pop = Number(req.query.pop) || 0;
    var sortBy = req.query.sort || "name";
    var direction = Number(req.query.direction) || 1;
    var skip = (page - 1) * limit;
    //
    limit = limit > maxLimit ? maxLimit : limit;
    if (Collection.hasOwnProperty(collname)) {
        var query = {active: true, name: {"$nin": ["Root", "Public"]}};
        var model = Collection[collname];
        var popQuery = "";
        if (model.getPopQuery) {
            popQuery = model.getPopQuery(pop);
            if (!Object.keys(popQuery).length) popQuery = "";
        }
        model.count(query).lean().catch(function (e) {
            next(e)
        })
        .then(function (length) {
            model
            .find(query)
            .sort({[sortBy]: direction}).skip(skip).limit(limit)
            .populate(popQuery).lean().then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send({
                    status: 200,
                    message: httpCode[200],
                    error: null,
                    data: {
                        limit: limit,
                        page: page,
                        sort: {[sortBy]: direction},
                        total: length,
                        rows: rows
                    }
                })
            })
            .catch(function (e) {
                next(e)
            })
        })
    } else next(req.params);
});
api.get('/organization', function (req, res, next) {
    var collname = 'organizations';
    var org = req.logged.user.organizations;
    var id = req.params.id;
    var pop = Number(req.query.pop) || 0;
    if (Collection.hasOwnProperty(collname)) {
        var query = {_id: org._id, active: true};
        var model = Collection[collname];
        var popQuery = "";
        if (model.getPopQuery) {
            popQuery = model.getPopQuery(pop);
            if (!Object.keys(popQuery).length) popQuery = "";
        }
        model.findOne(query)
        .populate(popQuery).lean()
        .then(function (docs) {
            var rows = mongoose.normalize(docs);
            res.send({
                status: 200,
                message: httpCode[200],
                error: null,
                data: rows
            })
        })
        .catch(function (e) {
            next(e)
        })
    } else next(req.params);
});
api.put('/organization', function (req, res, next) {
    res.send({})
});
api.get('/divisions', function (req, res, next) {
    res.send({})
});
api.get('/division/:id', function (req, res, next) {
    res.send({})
});
api.delete('/division/:id', function (req, res, next) {
    res.send({})
});
api.put('/division/:id', function (req, res, next) {
    res.send({})
});
api.post(function (req, res, next) {
    res.send({})
});
api.get('/roles', function (req, res, next) {
    res.send({})
});
api.get('/role/:id', function (req, res, next) {
    res.send({})
});
api.delete('/role/:id', function (req, res, next) {
    res.send({})
});
api.put('/role/:id', function (req, res, next) {
    res.send({})
});
api.post('/role/:id', function (req, res, next) {
    res.send({})
});
api.get('/jobdescs', function (req, res, next) {
    res.send({})
});
api.get('/jobdesc/:id', function (req, res, next) {
    res.send({})
});
api.delete('/jobdesc/:id', function (req, res, next) {
    res.send({})
});
api.put('/jobdesc/:id', function (req, res, next) {
    res.send({})
});
api.post('/jobdesc/:id', function (req, res, next) {
    res.send({})
});
api.get('/procedures', function (req, res, next) {
    res.send({})
});
api.get('/procedure/:id', function (req, res, next) {
    res.send({})
});
api.delete('/procedure/:id', function (req, res, next) {
    res.send({})
});
api.put('/procedure/:id', function (req, res, next) {
    res.send({})
});
api.post('/procedure/:id', function (req, res, next) {
    res.send({})
});
api.get('/steps', function (req, res, next) {
    res.send({})
});
api.get('/step/:id', function (req, res, next) {
    res.send({})
});
api.delete('/step/:id', function (req, res, next) {
    res.send({})
});
api.put('/step/:id', function (req, res, next) {
    res.send({})
});
api.post('/step/:id', function (req, res, next) {
    res.send({})
});
api.get('/users', function (req, res, next) {
    var collname = 'users';
    var org = req.logged.user.organizations;
    var limit = Number(req.query.limit) || maxLimit;
    var page = Number(req.query.page) || 1;
    var pop = Number(req.query.pop) || 0;
    var sortBy = req.query.sort || "name";
    var direction = Number(req.query.direction) || 1;
    var skip = (page - 1) * limit;
    //
    limit = limit > maxLimit ? maxLimit : limit;
    if (Collection.hasOwnProperty(collname)) {
        Collection["groups"]
        .find({active: true, name: {"$nin": ["Root", "Public"]}})
        .lean().then(function (docs) {
            var groups = mongoose.normalize(docs);
            var groupIds = groups.map(function (row) {
                return row._id
            });
            var query = {
                active: true,
                "organizations._id": org._id,
                "groups._id": {$in: groupIds}
            };
            var model = Collection[collname];
            var popQuery = "";
            if (model.getPopQuery) {
                popQuery = model.getPopQuery(pop);
                if (!Object.keys(popQuery).length) popQuery = "";
            }
            model.count(query).lean().catch(function (e) {
                next(e)
            })
            .then(function (length) {
                model
                .find(query)
                .sort({[sortBy]: direction}).skip(skip).limit(limit)
                .populate(popQuery).lean().then(function (docs) {
                    var rows = mongoose.normalize(docs);
                    res.send({
                        status: 200,
                        message: httpCode[200],
                        error: null,
                        data: {
                            limit: limit,
                            page: page,
                            sort: {[sortBy]: direction},
                            total: length,
                            rows: rows
                        }
                    })
                })
                .catch(function (e) {
                    next(e)
                })
            })
        })
        .catch(function (e) {
            next(e)
        })
    } else next(req.params);
});
api.get('/users/:id', function (req, res, next) {
    var collname = 'users';
    var org = req.logged.user.organizations;
    var id = req.params.id;
    var pop = Number(req.query.pop) || 0;
    if (Collection.hasOwnProperty(collname)) {
        Collection["groups"]
        .find({active: true, name: {"$nin": ["Root", "Public"]}})
        .lean().then(function (docs) {
            var groups = mongoose.normalize(docs);
            var groupIds = groups.map(function (row) {
                return row._id
            });
            var query = {
                active: true,
                "organizations._id": org._id,
                "groups._id": {$in: groupIds}
            };
            var model = Collection[collname];
            var popQuery = "";
            if (model.getPopQuery) {
                popQuery = model.getPopQuery(pop);
                if (!Object.keys(popQuery).length) popQuery = "";
            }
            model.findOne(query)
            .populate(popQuery).lean()
            .then(function (docs) {
                var rows = mongoose.normalize(docs);
                res.send({
                    status: 200,
                    message: httpCode[200],
                    error: null,
                    data: rows
                })
            })
            .catch(function (e) {
                next(e)
            })
        })
        .catch(function (e) {
            next(e)
        })
    } else next(req.params);
});
api.delete('/users/:id', function (req, res, next) {
    res.send({})
});
api.put('/users/:id', function (req, res, next) {
    res.send({})
});
api.post('/users/:id', function (req, res, next) {
    res.send({})
});