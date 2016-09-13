module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var userGroupSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        "userRoles._id" : {
            ref : 'userRole',
            type : Schema.Types.ObjectId,
            required : true
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var query = {
        path : "userRoles._id",
        select : "name routes",
        match : {active : true},
        populate : {
            path : "routes.urls._id",
            select : "name api",
            match : {active : true}
        }
    };
    userGroupSchema.statics.popFindOne = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.findOne(body).populate(query).exec(cb);
    };
    userGroupSchema.statics.popFind = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.find(body).populate(query).exec(cb);
    };
    return mongoose.model('userGroup', userGroupSchema);
};