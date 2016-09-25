module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var stepSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        description : String,
        stepNumber : {type : Number, min : 1, default : 1},
        duration : {type : Number, min : 0, default : 0},
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var procedureSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        description : String,
        steps : [stepSchema],
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
                    path : "medias._id",
                    select : "type directory description",
                    match : {active : true}
                }
            }
        };
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('procedure', procedureSchema);
};