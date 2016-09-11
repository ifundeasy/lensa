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
    return mongoose.model('procedure', procedureSchema);
};