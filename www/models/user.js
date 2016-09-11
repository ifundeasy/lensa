module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        username : String,
        avatar : String,
        name : {
            first : {type : String, default : ""},
            last : String
        },
        gender : String,
        password : String,
        email : {
            value : String,
            verified : { type: Boolean, default: false }
        },
        phone : {
            value : String,
            verified : { type: Boolean, default: false }
        },
        address : String,
        country : String,
        state : String,
        zipcode : String,
        birthDate : {type : Date, default : Date.now},
        "userTypes._id" : {
            ref : 'userType',
            type : Schema.Types.ObjectId
        },
        "organizations._id" : {
            ref : 'organization',
            type : Schema.Types.ObjectId
        },
        "organizationRoles._id" : {
            ref : 'organizationRole',
            type : Schema.Types.ObjectId
        },
        //verified : { type: Boolean, default: false },
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('user', schema);
};