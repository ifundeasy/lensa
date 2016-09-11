module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        name : String,
        "userRoles._id" : {
            ref : 'userRole',
            type : Schema.Types.ObjectId
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('userTypes', schema);
};