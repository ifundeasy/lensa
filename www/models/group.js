module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var routesSchema = new Schema({
        model: {
            type: String,
            lowercase: true,
            validate: {
                validator: function (v) {
                    var models = Object.keys(mongoose.models).map(function (key) {
                        return mongoose.models[key].collection.name
                    });
                    return models.indexOf(v.toLowerCase()) > -1;
                },
                message: '{VALUE} is not a valid model'
            },
            required: true
        },
        GET: {
            type: String,
            lowercase: true,
            required: true,
            enum: ["block", "self", "restrict", "all"],
            default: "block"
        },
        POST: {
            type: String,
            lowercase: true,
            required: true,
            enum: ["block", "self", "restrict", "all"],
            default: "block"
        },
        PUT: {
            type: String,
            lowercase: true,
            required: true,
            enum: ["block", "self", "restrict", "all"],
            default: "block"
        },
        DELETE: {
            type: String,
            lowercase: true,
            required: true,
            enum: ["block", "self", "restrict", "all"],
            default: "block"
        }
    })
    var groupSchema = new Schema({
        name: {
            type: String,
            required: true,
            unique: true
        },
        //routes : [routesSchema],
        restricted: {type: Boolean, default: false},
        notes: String,
        createdAt: {type: Date, default: Date.now},
        active: {type: Boolean, default: true}
    });
    return mongoose.model('group', groupSchema);
};