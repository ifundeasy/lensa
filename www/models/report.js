module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        id : String,
        title : String,
        description: String
    });
    return mongoose.model('report', schema);
};