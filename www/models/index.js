var fs = require('fs');
var path = require('path');
module.exports = function (dir, mongoose) {
    var o = {};
    var d = path.resolve(dir);
    fs.readdirSync(d).forEach(function (file) {
        var location = path.resolve(dir, file);
        var modelName = path.basename(location, '.js');
        if (modelName != 'index') {
            o[modelName] = require(location)(mongoose)
        }
    });
    return o;
};