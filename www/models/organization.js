module.exports = function (mongoose, regEx) {
    var Schema = mongoose.Schema;
    var orgSchema = new Schema({
        name : {
            type : String,
            required : true,
            unique : true
        },
        description : String,
        "medias._id" : { //avatar
            ref : 'media',
            type : Schema.Types.ObjectId
        },
        email : {
            value : {
                type : String,
                validate : {
                    validator : function (v) {
                        return regEx.email.test(v);
                    },
                    message : '{VALUE} is not a valid email address!'
                },
                unique : true,
                required : true,
            },
            verified : {type : Boolean, default : false}
        },
        phone : {
            value : {
                type : String,
                validate : {
                    validator : function (v) {
                        return regEx.phone.test(v);
                    },
                    message : '{VALUE} is not a valid phone number!'
                },
                //unique : true,
                //required : true,
            },
            verified : {type : Boolean, default : false}
        },
        lat : {
            type : String,
            required : true
        },
        long : {
            type : String,
            required : true
        },
        address : String,
        country : String,
        state : String,
        zipcode : String,
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    orgSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path : "medias._id",
            select : "type directory description",
            match : {active : true}
        };
        return mongoose.nested(populate, nestIdx)
    };
    return mongoose.model('organization', orgSchema);
};