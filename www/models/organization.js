module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        name : String,
        description : String,
        avatar : String,
        email : {
            value : String,
            verified : { type: Boolean, default: false }
        },
        phone : {
            value : String,
            verified : { type: Boolean, default: false }
        },
        lat : String,
        long : String,
        address : String,
        country : String,
        state : String,
        zipcode : String,
        notes : String,
        createdAt : { type: Date, default: Date.now },
        active : { type: Boolean, default: true }
    });
    return mongoose.model('organization', schema);
};