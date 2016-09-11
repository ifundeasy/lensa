module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        "organizationRoles._id" : {
            ref : 'organizationRole',
            type : Schema.Types.ObjectId
        },
        "organizationCategories._id" : {
            ref : 'organizationCategory',
            type : Schema.Types.ObjectId
        },
        name : String,
        description : String,
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('organizationJobDesc', schema);
};