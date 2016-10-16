module.exports = function (mongoose, opts) {
    var Schema = mongoose.Schema;
    var orgSchema = new Schema({
        name : {
            type : String,
            required : true,
            unique : true
        },
        pic : {
            type : String,
            required : true,
            unique : true
        },
        "media._id" : { //avatar
            ref : 'media',
            type : Schema.Types.ObjectId
        },
        email : {
            value : {
                type : String,
                trim : true,
                lowercase : true,
                match : [opts.regEx.email, '{VALUE} is not a valid email address!'],
                unique : true,
                required : true
            },
            verifyUrl : String,
            verified : {type : Boolean, default : false}
        },
        phone : {
            value : {
                type : String,
                trim : true,
                lowercase : true,
                match : [opts.regEx.phone, '{VALUE} is not a valid phone number!'],
                unique : true,
                required : true
            },
            verifyCode : String,
            verified : {type : Boolean, default : false}
        },
        location: {
            address : String,
            country : String,
            state : String,
            zipcode : String,
            administrativeAreaLevel: Number,
            administrativeName: String,
            lat : {
                type : Number,
                required : true
            },
            long : {
                type : Number,
                required : true
            },
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    orgSchema.statics.getPopQuery = function (nestIdx) {
        var populate = {
            path : "media._id",
            select : "type directory description",
            match : {active : true}
        };
        return mongoose.nested(populate, nestIdx)
    };
    orgSchema.pre('update', function (next) {
        var org = this._update.$set;
        if (org["phone.value"]) org["phone.value"] = org["phone.value"].replace(/[\(\)\+\-\s]/g, "");
        return next();
    });
    orgSchema.pre('save', function (next) {
        var org = this;
        org.phone.value = org.phone.value.replace(/[\(\)\+\-\s]/g, "");
        return next();
    });
    return mongoose.model('organization', orgSchema);
};