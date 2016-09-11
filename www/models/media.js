module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        type : String,
        directory : String,
        description : String,
        notes : String,
        createdAt : { type: Date, default: Date.now },
        active : { type: Boolean, default: true }
    });
    return mongoose.model('media', schema);
};