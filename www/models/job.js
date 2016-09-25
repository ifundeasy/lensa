module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var jobSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        description : String,
        "roles._id" : {
            ref : 'role',
            type : Schema.Types.ObjectId,
            required : true
        },
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
    jobSchema.statics.getPopQuery = function (nestIdx) {
        var populate = [
            {
                path : "roles._id",
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
            },
            {
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
            }
        ];
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('job', jobSchema);
};