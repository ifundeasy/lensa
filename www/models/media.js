module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var mediaScema = new Schema({
        type : String,
        directory : {type : String, required : true}, // kok tadinya Date?
        description : String,
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    mediaScema.statics.popFindOne = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.findOne(body).exec(cb);
    };
    mediaScema.statics.popFind = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.find(body).exec(cb);
    };
    return mongoose.model('media', mediaScema);
};