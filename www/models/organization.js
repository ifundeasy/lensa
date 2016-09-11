module.exports = function (mongoose, regEx) {
    var Schema = mongoose.Schema;
    var orgSchema = new Schema({
        name : {
            type : String,
            required : true
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
    var query = {
        path : "medias._id",
        select : "type directory description",
        match : {active : true}
    };
    orgSchema.statics.popFindOne = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.findOne(body).populate(query).exec(cb);
    };
    orgSchema.statics.popFind = function (body, cb) {
        body = body || {};
        body.active = body.hasOwnProperty("active") ? body.active : true;
        return this.find(body).populate(query).exec(cb);
    };
    return mongoose.model('organization', orgSchema);
};