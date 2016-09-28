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
    //
    stepSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path : "procedure._id",
            select : "name description procedures._id",
            match : {active : true}
        };
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('step', stepSchema);
};