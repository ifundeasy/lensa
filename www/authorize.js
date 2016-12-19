Authorize = function (obj) {
    obj = obj || {};
    this.models = obj.models;
    this.rule = obj.rule;
    this.population = obj.population;
    return this;
};
//
Authorize.prototype.clean = function (str) {
    var cols = str.split(".");
    return cols[cols.length - 2];
    //return str.replace("._ids", "").replace("._id", "");
};
Authorize.prototype.isCorrect = function (row) {
    var is = true;
    var recursive = function (obj) {
        for (var o in obj) {
            if (obj[o]) {
                if (obj[o].constructor == Object) {
                    if (obj[o].hasOwnProperty("_id") && !obj[o]._id) {
                        is = false;
                        break;
                    }
                    recursive(obj[o]);
                } else if (obj[o].constructor == Array) recursive(obj[o]);
            }
        }
    };
    if (row) {
        if (row.constructor == Object) recursive(row);
    }
    return is;
};
//
Authorize.prototype.init = function (callback, fallback) {
    this.finder(this.population, callback, fallback);
};
Authorize.prototype.setPopulation = function (population) {
    this.population = population;
    return this.population;
};
Authorize.prototype.setModels = function (models) {
    this.models = models;
    return this.models;
};
Authorize.prototype.setRule = function (rule) {
    this.rule = rule;
    return this.rule;
};
Authorize.prototype.finder = function (NESTED, CALLBACK, FALLBACK) {
    var me = this;
    var rule = me.rule;
    var models = me.models;
    var temp = {};
    var recursive = function (nested, callback, fallback) {
        if (nested.constructor == Array) {
            var loop = function (i, cb) {
                if (i < nested.length) {
                    recursive(nested[i], function () {
                        loop(i + 1, cb)
                    }, fallback)
                } else {
                    cb(NESTED)
                }
            }
            loop(0, callback);
        } else {
            var name = me.clean(nested.path);
            //console.log(">>", name)
            if (!rule[name]) {
                //console.log("..", name)
                if (nested.populate) {
                    if (nested.populate.constructor == Array) {
                        recursive(nested.populate, callback, fallback)
                    } else {
                        var pop = {
                            path: nested.populate["path"],
                            select: nested.populate["select"],
                            match: nested.populate["match"]
                        };
                        var nme = me.clean(pop.path);
                        if (rule[nme]) {
                            for (var k in rule[nme]) {
                                pop.match = pop.match || {};
                                pop.match[k] = rule[nme][k];
                            }
                        }
                        models[name].find({
                            active: true
                        }).populate(pop).lean()
                        .catch(function (e) {
                            fallback(e)
                        })
                        .then(function (docs) {
                            var ids = docs.map(function (doc) {
                                return doc._id
                            });
                            if (ids.length) {
                                nested.match._id = {
                                    $in: docs.map(function (doc) {
                                        return doc._id
                                    })
                                }
                            }
                            recursive(nested.populate, callback, fallback)
                        })
                    }
                } else callback(NESTED);
            } else {
                //console.log("  ", name)
                for (var k in rule[name]) {
                    nested.match = nested.match || {};
                    nested.match[k] = rule[name][k];
                }
                if (nested.populate) recursive(nested.populate, callback, fallback)
                else callback(NESTED);
            }
        }
    };
    recursive(NESTED, CALLBACK, FALLBACK)
};
module.exports = Authorize;
