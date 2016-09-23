var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
mongoose.nested = function (obj, nestIdx) {
    nestIdx = nestIdx == -1 ? Infinity : nestIdx
    if (!nestIdx && !(nestIdx == 0)) return obj;
    else if (nestIdx == 0) return {};
    return (function nest(o, j) {
        if (o.constructor == Array) {
            o.forEach(function (pop) {
                nest(pop, j)
            })
        } else if (o.constructor == Object) {
            if ((j < nestIdx-1) && o.populate) {
                j += 1;
                nest(o.populate, j)
            } else {
                delete o.populate
            }
        }
        return o;
    })(obj, 0)
};
mongoose.normalize = function (obj) {
    return new (function grep(obj) {
        if (obj && typeof obj == "object") {
            if (obj.constructor == Array) {
                obj.forEach(function (nest, e) {
                    grep(nest)
                })
            } else if (obj.constructor == Object) {
                delete obj['__v'];
                if (obj['_id'] && obj.hasOwnProperty('_id')) {
                    if (obj['_id'].constructor == Object) {
                        var clone = obj['_id'];
                        delete obj['_id'];
                        for (var i in clone) obj[i] = clone[i];
                    }
                }
                for (var o in obj) {
                    if (obj[o]) {
                        if (Object.keys(obj[o]).length == 1) {
                            if (Object.keys(obj[o])[0] == '_ids') {
                                if (obj[o]['_ids']) {
                                    if (obj[o]['_ids'].constructor == Array) {
                                        obj[o] = obj[o]['_ids']
                                    }
                                }
                            }
                        }
                    }
                    grep(obj[o])
                }
            }
        }
        return obj
    })(JSON.parse(JSON.stringify(obj)))
}
mongoose.Promise = require('bluebird');
module.exports = mongoose;