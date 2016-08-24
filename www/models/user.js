module.exports = function (mongoose, connection) {
    var schema = new mongoose.Schema({
        username : String,
        password : String
    });
    return mongoose.model('user', schema);
};