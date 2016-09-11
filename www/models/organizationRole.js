module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        name : String,
        description : String,
        "organizations._id" : {
            ref : 'organization',
            type : Schema.Types.ObjectId
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('organizationRole', schema);
};