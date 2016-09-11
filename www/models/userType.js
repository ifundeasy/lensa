module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var userTypeSchema = new Schema({
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
    return mongoose.model('userType', userTypeSchema);
};