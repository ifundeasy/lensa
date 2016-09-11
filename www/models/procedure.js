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
        "organizationCategories._id" : {
            ref : 'organizationCategory',
            type : Schema.Types.ObjectId,
            required : true
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var query = {
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
    };
    procedureSchema.statics.popFindOne = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.findOne(body).populate(query).exec(cb);
    };
    procedureSchema.statics.popFind = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.find(body).populate(query).exec(cb);
    };
    return mongoose.model('procedure', procedureSchema);
};