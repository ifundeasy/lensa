module.exports = (function () {
    var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'hell yeah! this is my "password" :)';

    return {
        en : function (text) {
            var cipher = crypto.createCipher(algorithm, password);
            var en = cipher.update(text, 'utf8', 'hex');
            en += cipher.final('hex');
            return en;
        },
        de : function (hash) {
            var decipher = crypto.createDecipher(algorithm, password);
            var de = decipher.update(hash, 'hex', 'utf8');
            de += decipher.final('utf8');
            return de;
        }
    }
})();