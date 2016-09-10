module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        id : Number,
        createdDate : Date,
        name : String,
        routes : [],
        notes : String,
        active : Boolean
    });
    return mongoose.model('userRoles', schema);
};