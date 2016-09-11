module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var urlSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        api : String,
        notes : String,
        createdAt : { type: Date, default: Date.now },
        active : { type: Boolean, default: true }
    });
    return mongoose.model('url', urlSchema);
};