module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    
    var procedureSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        description : String,
        "categories._id" : {
            ref : 'category',
            type : Schema.Types.ObjectId,
            required : true
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    procedureSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path : "categories._id",
            select : "name description organizations._id",
            match : {active : true},
            populate : {
                path : "organizations._id",
                select : "name description",
                match : {active : true},
                populate : {
                    path : "media._id",
                    select : "type directory description",
                    match : {active : true}
                }
            }
        };
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('procedure', procedureSchema);
};