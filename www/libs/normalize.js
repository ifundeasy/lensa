module.exports = function (obj) {
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
};