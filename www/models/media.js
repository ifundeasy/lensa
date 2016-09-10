module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        id : Number,
        createdDate : Date,
        type : String,
        directory : String,
        description : String,
        active : Boolean
    });
    return mongoose.model('medias', schema);
};