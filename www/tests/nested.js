var t = [
    {
        path : "medias._ids",
        select : "type directory description",
        match : {active : true}
    },
    {
        path : "users._id",
        select : "name username",
        match : {active : true},
        populate : [
            {
                path : "medias._ids",
                select : "type directory description",
                match : {active : true}
            },
            {
                path : "userGroups._id",
                select : "name userRoles._id",
                match : {active : true},
                populate : {
                    path : "userRoles._id",
                    select : "name routes",
                    match : {active : true},
                    populate : {
                        path : "routes.urls._id",
                        select : "name api",
                        match : {active : true}
                    }
                }
            },
            {
                path : "organizations._id",
                select : "name description",
                match : {active : true},
                populate : {
                    path : "medias._id",
                    select : "type directory description",
                    match : {active : true}
                }
            },
            {
                path : "organizationRoles._id",
                select : "name description organizations._id",
                match : {active : true},
                populate : {
                    path : "organizations._id",
                    select : "name description",
                    match : {active : true},
                    populate : {
                        path : "medias._id",
                        select : "type directory description",
                        match : {active : true}
                    }
                }
            }
        ]
    },
    {
        path : "comments.users._id",
        select : "name username",
        match : {active : true},
        populate : [
            {
                path : "userGroups._id",
                select : "name userRoles._id",
                match : {active : true},
                populate : {
                    path : "userRoles._id",
                    select : "name routes",
                    match : {active : true},
                    populate : {
                        path : "routes.urls._id",
                        select : "name api",
                        match : {active : true}
                    }
                }
            },
            {
                path : "organizations._id",
                select : "name description",
                match : {active : true},
                populate : {
                    path : "medias._id",
                    select : "type directory description",
                    match : {active : true}
                }
            },
            {
                path : "organizationRoles._id",
                select : "name description organizations._id",
                match : {active : true},
                populate : {
                    path : "organizations._id",
                    select : "name description",
                    match : {active : true},
                    populate : {
                        path : "medias._id",
                        select : "type directory description",
                        match : {active : true}
                    }
                }
            }
        ]
    },
    {
        path : "comments.medias._ids",
        select : "type directory description",
        match : {active : true}
    },
    {
        path : "statuses.users._id",
        select : "name username",
        match : {active : true},
        populate : [
            {
                path : "userGroups._id",
                select : "name userRoles._id",
                match : {active : true},
                populate : {
                    path : "userRoles._id",
                    select : "name routes",
                    match : {active : true},
                    populate : {
                        path : "routes.urls._id",
                        select : "name api",
                        match : {active : true}
                    }
                }
            },
            {
                path : "organizations._id",
                select : "name description",
                match : {active : true},
                populate : {
                    path : "medias._id",
                    select : "type directory description",
                    match : {active : true}
                }
            },
            {
                path : "organizationRoles._id",
                select : "name description organizations._id",
                match : {active : true},
                populate : {
                    path : "organizations._id",
                    select : "name description",
                    match : {active : true},
                    populate : {
                        path : "medias._id",
                        select : "type directory description",
                        match : {active : true}
                    }
                }
            }
        ]
    },
    {
        path : "statuses.procedure._id",
        select : "name description steps organizationCategories._id",
        match : {active : true},
        populate : {
            path : "organizationCategories._id",
            select : "name description organizations._id",
            match : {active : true},
            populate : {
                path : "organizations._id",
                select : "name description",
                match : {active : true},
                populate : {
                    path : "medias._id",
                    select : "type directory description",
                    match : {active : true}
                }
            }
        }
    }
];
var nested = function (obj, n) {
    var i = 0;
    var obj = JSON.parse(JSON.stringify(obj));
    var lol = function (o, j) {
        console.log(j, j < n)
        if (j < n && o.populate) {
            if (o.populate.constructor == Array) {
                j += 1;
                o.populate.forEach(function (pop) {
                    lol(pop, j)
                })
            } else if (o.populate.constructor == Object) {
                j += 1;
                lol(o.populate, j)
            }
        } else {
            delete o.populate
        }
        return o
    };
    return lol(obj, 0)
}
var nested = function (obj, n) {
    var obj = JSON.parse(JSON.stringify(obj));
    var lol = function (o, j) {
        if (o.constructor == Array) {
            o.forEach(function (pop) {
                lol(pop, j)
            })
        } else if (o.constructor == Object) {
            if (j < n && o.populate) {
                j += 1;
                lol(o.populate, j)
            } else {
                delete o.populate
            }
        }
        return o;
    }
    return lol(obj, 0)
}
var nested = function (obj, n) {
    return (function nest (o, j) {
        if (o.constructor == Array) {
            o.forEach(function (pop) {
                nest(pop, j)
            })
        } else if (o.constructor == Object) {
            if (j < n && o.populate) {
                j += 1;
                nest(o.populate, j)
            } else {
                delete o.populate
            }
        }
        return o;
    })(obj, 0)
};
console.log(JSON.stringify(nested(t,1),0,2))