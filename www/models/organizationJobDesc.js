module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var orgJobDescSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        description : String,
        "organizationRoles._id" : {
            ref : 'organizationRole',
            type : Schema.Types.ObjectId,
            required : true
        },
        "organizationCategories._id" : {
            ref : 'organizationCategory',
            type : Schema.Types.ObjectId,
            required : true
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('organizationJobDesc', orgJobDescSchema);
};