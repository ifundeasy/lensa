module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var orgCatSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        description : String,
        "organizations._id" : {
            ref : 'organization',
            type : Schema.Types.ObjectId,
            required : true
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var query = {
        path : "organizations._id",
        select : "name description",
        populate : {
            path : "medias._id",
            select : "type directory description",
            match : {active : true}
        }
    };
    orgCatSchema.statics.popFindOne = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.findOne(body).populate(query).exec(cb);
    };
    orgCatSchema.statics.popFind = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.find(body).populate(query).exec(cb);
    };
    return mongoose.model('organizationCategory', orgCatSchema);
};