module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var orgJobDescSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        description : String,
        "organizationRoles._id" : {
            ref : 'organizationRole',
            type : Schema.Types.ObjectId,
            required : true
        },
        "organizationCategories._id" : {
            ref : 'organizationCategory',
            type : Schema.Types.ObjectId,
            required : true
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    orgJobDescSchema.statics.getPopQuery = function (nestIdx) {
        var populate = [
            {
                path : "organizationRoles._id",
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
                path : "organizationCategories._id",
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
    return mongoose.model('organizationJobDesc', orgJobDescSchema);
};