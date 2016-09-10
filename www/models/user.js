module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        id : Number,
        userType_id : Number,
        organization_id : Number,
        organizationRole_id : Number,
        username : String,
        name : String,
        phone : String,
        email : String,
        address : String,
        country : String,
        state : String,
        zipcode : String,
        birthDate : Date,
        avatar : String,
        gender : String,
        password : String,
        createdDate : Date,
        notes : String,
        verified : Boolean,
        active : Boolean
    });
    return mongoose.model('users', schema);
};