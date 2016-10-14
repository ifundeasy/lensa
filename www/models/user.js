var bcrypt = require('bcrypt');
//
module.exports = function (mongoose, opts) {
    var regEx = opts.regEx;
    var getCode4 = opts.getCode4;
    var factory = opts.factory;
    //
    var Schema = mongoose.Schema;
    var userSchema = new Schema({
        username : {
            type : String,
            required : true,
            lowercase : true,
            minlength : 4,
            maxlength : 20,
            match : [regEx.username, '{VALUE} is not a valid username format!'],
            unique : true,
            index : true
        },
        "media._id" : { //avatar
            ref : 'media',
            type : Schema.Types.ObjectId
        },
        name : {
            first : String,
            last : String
        },
        gender : {
            type : String,
            required : true,
            enum : ['male', 'female'],
            default : 'male'
        },
        password : {
            type : String,
            minlength : 4,
            match : [regEx.password, '{VALUE} is not a valid password format!'],
            required : true
        },
        email : {
            value : {
                type : String,
                trim : true,
                lowercase : true,
                match : [regEx.email, '{VALUE} is not a valid email address!'],
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
                //v = v.replace(/[\(\)\+\-\s]/g, "");
                match : [regEx.phone, '{VALUE} is not a valid phone number!'],
                unique : true,
                required : false
            },
            verifyCode : String,
            verified : {type : Boolean, default : false}
        },
        address : String,
        country : String,
        state : String,
        zipcode : String,
        birthDate : {type : Date, default : Date.now},
        "groups._id" : {
            ref : 'group',
            type : Schema.Types.ObjectId,
            required : true
        },
        "organizations._id" : {
            ref : 'organization',
            type : Schema.Types.ObjectId,
            required : true
        },
        "roles._id" : {
            ref : 'role',
            type : Schema.Types.ObjectId
        },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    userSchema.virtual('name.full').get(function () {
        return this.name.first + ' ' + this.name.last;
    });
    userSchema.pre('update', function (next) {
        var older = {};
        var user = this._update.$set;
        var verifyPwd = function (callback) {
            if (!user["password"]) return callback();
            //
            bcrypt.genSalt(factory, function (err, salt) {
                if (err) return callback(err);
                bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) return callback(err);
                    user.password = hash;
                    return callback();
                });
            });
        }
        var verifyPhone = function (callback) {
            if (!user["phone.value"] || (older.phone.value == user["phone.value"])) return callback();
            //
            user["phone.value"] = user["phone.value"].replace(/[\(\)\+\-\s]/g, "");
            user["phone.verifyCode"] = "";
            user["phone.verified"] = false;
            return callback();
        }
        var verifyEmail = function (callback) {
            if (!user["email.value"] || (older.email.value == user["email.value"])) {
                if (older.email.verifyUrl !== user["email.verifyUrl"]) user["email.verified"] = false;
            } else {
                user["email.verifyUrl"] = "";
                user["email.verified"] = false;
            }
            return callback();
        }
        this.findOne(this._conditions).lean().then(function (docs) {
            older = (docs);
            verifyPwd(function(){
                verifyEmail(function () {
                    verifyPhone(next);
                })
            })
        }).catch(function (e) {
            return next(e)
        })
    });
    userSchema.pre('save', function (next) {
        var user = this;
        if(user.phone.value) user.phone.value = user.phone.value.replace(/[\(\)\+\-\s]/g, "");
        if (!user.isModified('password')) return next();
        // generate a salt
        bcrypt.genSalt(factory, function (err, salt) {
            if (err) return next(err);
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                var url = user.email.value + new Date().getTime().toString(36);
                if (err) return next(err);
                // override the cleartext password with the hashed one
                user.password = hash;
                if(user.phone.value) user.phone.verifyCode = getCode4();
                if(user.phone.value) user.phone.verified = false;
                user.email.verified = false;
                bcrypt.hash(url, salt, function (err, mailhash) {
                    if (err) return next(err);
                    user.email.verifyUrl = mailhash;
                    next();
                });
            });
        });
    });
    userSchema.methods.pwdCheck = function (input, cb) {
        bcrypt.compare(input, this.password, function (err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    };
    //
    userSchema.statics.getPopQuery = function (nestIdx) {
        var populate = [
            {
                path : "media._ids",
                select : "type directory description",
                match : {active : true}
            },
            {
                path : "groups._id",
                select : "name routes",
                match : {active : true}
            },
            {
                path : "organizations._id",
                select : "name description",
                match : {active : true},
                populate : {
                    path : "media._id",
                    select : "type directory description",
                    match : {active : true}
                }
            },
            {
                path : "roles._id",
                select : "name description organizations._id",
                match : {active : true},
                populate : {
                    path : "organizations._id",
                    select : "name description",
                    match : {active : true},
                    populate : {
                        path : "media._id",
                        select : "type directory description",
                        match : {active : true}
                    }
                }
            }
        ];
        return mongoose.nested(populate, nestIdx)
    };
    //
    return mongoose.model('user', userSchema);
};