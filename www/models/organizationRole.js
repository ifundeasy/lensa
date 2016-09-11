module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var orgRoleSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        description : String,
        "organizations._id" : {
            ref : 'organization',
            type : Schema.Types.ObjectId,
            required : true
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('organizationRole', orgRoleSchema);
};