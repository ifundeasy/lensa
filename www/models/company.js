module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		name: String,
		email: String,
		phone: String,
		avatar: String,
		description: String,
		created_date: Date,
		lat: String,
		long: String,
		active: Boolean
    });
    return mongoose.model('company', schema);
};