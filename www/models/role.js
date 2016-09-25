module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var roleSchema = new Schema({
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
    //
    roleSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path : "organizations._id",
            select : "name description",
            populate : {
                path : "medias._id",
                select : "type directory description",
                match : {active : true}
            }
        };
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('role', roleSchema);
};