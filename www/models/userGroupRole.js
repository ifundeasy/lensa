module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var userGroupRoleSchema = new Schema({
        name : {
            type : String,
            required : true
        },
        routes : [
            {
                model : {
                    type : String,
                    lowercase: true,
                    validate : {
                        validator : function (v) {
                            var models = Object.keys(mongoose.models).map(function(key){
                                return mongoose.models[key].collection.name
                            });
                            return models.indexOf(v.toLowerCase()) > -1;
                        },
                        message : '{VALUE} is not a valid model'
                    },
                    required : true
                },
                methods : [{
                    type : String,
                    required : true,
                    enum : ["GET", "POST", "PUT", "DELETE"],
                    default : "GET"
                }]
            }
        ],
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('userGroupRole', userGroupRoleSchema);
};