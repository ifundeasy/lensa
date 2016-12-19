module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var stepSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        description: String,
        stepNumber: {type: Number, min: 1, default: 1},
        duration: {type: Number, min: 0, default: 0},
        "procedures._id": {
            ref: 'procedure',
            type: Schema.Types.ObjectId,
            required: true
        },
        notes: String,
        createdAt: {type: Date, default: Date.now},
        active: {type: Boolean, default: true}
    });
    //
    stepSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path: "procedures._id",
            select: "name description categories._id",
            match: {active: true},
            populate: {
                path: "categories._id",
                select: "name description organizations._id",
                match: {active: true},
                populate: {
                    path: "organizations._id",
                    select: "name description",
                    match: {active: true},
                    populate: {
                        path: "media._id",
                        select: "type directory description",
                        match: {active: true}
                    }
                }
            }
        };
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('step', stepSchema);
};