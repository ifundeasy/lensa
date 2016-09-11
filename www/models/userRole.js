module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
        name : String,
        routes : [
            {
                create : {type : Boolean, default : true},
                read : {type : Boolean, default : true},
                update : {type : Boolean, default : true},
                delete : {type : Boolean, default : false},
                url : String,
            }
        ],
        notes : String,
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('userRole', schema);
};