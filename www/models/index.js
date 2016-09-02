var fs = require('fs');
module.exports = function (dir, mongoose) {
    return {
        category : require(dir + 'category')(mongoose),
        company : require(dir + 'company')(mongoose),
        internal : require(dir + 'internal')(mongoose),
        report : require(dir + 'report')(mongoose),
        reporthistory : require(dir + 'reporthistory')(mongoose),
        reportstatus : require(dir + 'reportstatus')(mongoose),
        role : require(dir + 'role')(mongoose),
        role_category : require(dir + 'role_category')(mongoose),
        sop : require(dir + 'sop')(mongoose),
        sop_reportstatus : require(dir + 'sop_reportstatus')(mongoose),
        user : require(dir + 'user')(mongoose)
    }
};