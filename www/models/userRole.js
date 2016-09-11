module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var userRoleSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        routes : [
            {
                "urls._id" : {
                    ref : 'url',
                    type : Schema.Types.ObjectId
                },
                getting  : {type : Boolean, default : true},
                creating : {type : Boolean, default : true},
                updating : {type : Boolean, default : true},
                deleting : {type : Boolean, default : false}
            }
        ],
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('userRole', userRoleSchema);
};