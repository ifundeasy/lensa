module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var comment = new Schema({
        id : Number,
        createdDate : Date,
        user_id : Number,
        text : String,
        active : Boolean
    });
    var status = new Schema({
        id : Number,
        createdDate : Date,
        user_id : Number,
        procedure_id : Number,
        active : Boolean
    });
    var schema = new Schema({
        id : Number,
        user_id : Number,
        media_id : Number,
        createdDate : Date,
        title : String,
        text : String,
        statuses : [comment],
        comments : [status],
        active : Boolean
    });
    return mongoose.model('posts', schema);
};