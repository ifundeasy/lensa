module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var commentSchema = new Schema({
        text : String,
        "users._id" : {
            ref : 'user',
            type : Schema.Types.ObjectId,
            required : true
        },
        "medias._ids" : [
            {
                ref : 'media',
                type : Schema.Types.ObjectId
            }
        ],
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var statusSchema = new Schema({
        "users._id" : {
            ref : 'user',
            type : Schema.Types.ObjectId,
            required : true
        },
        "procedures._id" : {
            ref : 'procedure',
            type : Schema.Types.ObjectId,
            required : true
        },
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    var postSchema = new Schema({
        title : {
            type : String,
            required : true
        },
        text : String,
        "users._id" : {
            ref : 'user',
            type : Schema.Types.ObjectId,
            required : true
        },
        "medias._ids" : [
            {
                ref : 'media',
                type : Schema.Types.ObjectId
            }
        ],
        statuses : [commentSchema],
        comments : [statusSchema],
        createdAt : {type : Date, default : Date.now},
        active : {type : Boolean, default : true}
    });
    return mongoose.model('post', postSchema);
};