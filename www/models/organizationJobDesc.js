module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        id : Number,
        organizationRole_id : Number,
        organizationCategory_id : Number,
        createdDate : Date,
        name : String,
        description : String,
        active : Boolean
    });
    return mongoose.model('organizationJobDescs', schema);
};