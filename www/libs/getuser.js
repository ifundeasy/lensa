var base64 = require('./base64');

module.exports = function(cookieId, User, cb){
    var usrhash = cookieId.substr(cookieId.indexOf('/') + 1);
    var usr = base64.decode(usrhash);
    //
    if (!usr) cb(true, 'invalid cookie');
    User.findOne({username : usr}, function (err, user) {
        if (!err) {
            cb(false, usr);
        } else {
            cb(true, 'invalid username : '+usr);
        }
    });
}