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
    var query = [
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
    orgJobDescSchema.statics.popFindOne = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.findOne(body).populate(query).exec(cb);
    };
    orgJobDescSchema.statics.popFind = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.find(body).populate(query).exec(cb);
    };
    return mongoose.model('organizationJobDesc', orgJobDescSchema);
};