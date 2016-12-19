var fs = require('fs');
var path = require('path');
module.exports = function (mongoose, obj) {
    var o = {};
    var d = path.resolve(obj.directory);
    fs.readdirSync(d).forEach(function (file) {
        var location = path.resolve(obj.directory, file);
        var modelName = path.basename(location, '.js');
        if ((modelName.indexOf(".") !== 0) && modelName != 'index') {
            o[modelName] = require(location)(mongoose, {
                regEx: obj.regEx,
                getCode4: obj.getCode4,
                factory: obj.factory
            });
        }
    });
    return o;
};