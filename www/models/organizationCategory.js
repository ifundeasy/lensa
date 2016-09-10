module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        id : Number,
        organization_id : Number,
        createdDate : Date,
        name : String,
        description : String,
        active : Boolean
    });
    return mongoose.model('organizationCategories', schema);
};