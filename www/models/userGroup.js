module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var userGroupSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        "userGroupRoles._id" : {
            ref : 'userGroupRole',
            type : Schema.Types.ObjectId,
            required : true
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    userGroupSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path : "userGroupRoles._id",
            select : "name routes",
            match : {active : true}
        };
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('userGroup', userGroupSchema);
};