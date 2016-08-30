module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
    	id: Number,
    	user_id: Number,
		title: String,
		description: String,
		created_date: Date,
		category_id: Number,
		status_id: Number,
		images: [String],
		lat: String,
		long: String,
		active: Boolean
    });
    return mongoose.model('report', schema);
};