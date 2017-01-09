module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var notificationSchema = new Schema({
        "users._id": {
            ref: 'user',
            type: Schema.Types.ObjectId,
            required: true
        },
        title: String,
        description: String,
        link: String,
        createdAt: {type: Date, default: Date.now},
        active: {type: Boolean, default: true}
    });
    //
    /*notificationSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path: "organizations._id",
            select: "name description",
            populate: {
                path: "media._id",
                select: "type directory description",
                match: {active: true}
            }
        };
        return mongoose.nested(populate, nestIdx)
    };*/
    return mongoose.model('notification', notificationSchema);
};