var factory = 7, bcrypt = require('bcrypt');
//
module.exports = function (mongoose, regEx) {
    var Schema = mongoose.Schema;
    var userSchema = new Schema({
        username : {
            type : String,
            validate : {
                validator : function (v) {
                    return regEx.username.test(v);
                },
                message : '{VALUE} is not a valid email address!'
            },
            required : true,
            lowercase : true,
            minlength : 5,
            maxlength : 20,
            unique : true,
            index : true
        },
        "medias._id" : { //avatar
            ref : 'media',
            type : Schema.Types.ObjectId
        },
        name : {
            first : String,
            last : {
                type : String,
                validate : {
                    validator : function (v) {
                        return regEx.username.test(v);
                    },
                    message : '{VALUE} is not a valid last name!'
                },
                required : true,
                minlength : 5,
                maxlength : 20,
            }
        },
        gender : {
            type : String,
            required : true,
            enum : ['male', 'female']
        },
        password : {
            type : String,
            validate : {
                validator : function (v) {
                    return regEx.password.test(v);
                },
                message : '{VALUE} is not a valid password format!'
            },
            required : true
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
        address : String,
        country : String,
        state : String,
        zipcode : String,
        birthDate : {type : Date, default : Date.now},
        "userGroups._id" : {
            ref : 'userGroup',
            type : Schema.Types.ObjectId,
            required : true
        },
        "organizations._id" : {
            ref : 'organization',
            type : Schema.Types.ObjectId,
            required : true
        },
        "organizationRoles._id" : {
            ref : 'organizationRole',
            type : Schema.Types.ObjectId,
            required : true
        },
        //verified : { type: Boolean, default: false },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    //
    userSchema.virtual('name.full').get(function () {
        return this.name.first + ' ' + this.name.last;
    });
    userSchema.pre('save', function (next) {
        var user = this;
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();
        // generate a salt
        bcrypt.genSalt(factory, function (err, salt) {
            if (err) return next(err);
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                // override the cleartext password with the hashed one
                user.password = hash;
                next();
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
                path : "medias._ids",
                select : "type directory description",
                match : {active : true}
            },
            {
                path : "userGroups._id",
                select : "name routes",
                match : {active : true}
            },
            {
                path : "organizations._id",
                select : "name description",
                match : {active : true},
                populate : {
                    path : "medias._id",
                    select : "type directory description",
                    match : {active : true}
                }
            },
            {
                path : "organizationRoles._id",
                select : "name description organizations._id",
                match : {active : true},
                populate : {
                    path : "organizations._id",
                    select : "name description",
                    match : {active : true},
                    populate : {
                        path : "medias._id",
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