module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var urlSchema = new Schema({
        name : {
            type : String,
            required : true,
            unique : true
        },
        tableName : {
            type : String,
            required : true,
            unique : true
        },
        notes : String,
        createdAt : { type: Date, default: Date.now },
        active : { type: Boolean, default: true }
    });
    var query = [];
    urlSchema.statics.popFindOne = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.findOne(body).populate(query).exec(cb);
    };
    urlSchema.statics.popFind = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.find(body).populate(query).exec(cb);
    };
    return mongoose.model('route', urlSchema);
};