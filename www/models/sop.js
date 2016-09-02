module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		name: String,
		description: String,
		category_id: Number,
		active: Boolean
    });
    return mongoose.model('sop', schema);
};