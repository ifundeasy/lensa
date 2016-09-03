module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
    	id: Number,
    	report_id: Number,
		text: String,
		user_id: Number,
		internal_id: Number,
		date: Date,
		active: Boolean
    });
    return mongoose.model('comment', schema);
};