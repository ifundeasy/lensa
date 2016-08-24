module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        username : String,
        password : String
    });
    return mongoose.model('user', schema);
};