module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		name: String,
		email: String,
		phone: String,
		avatar: String,
		description: String,
		address: String,
		country: String,
		state: String,
		zipcode: String
		createdDate: Date,
		lat: String,
		long: String,
		notes: String,
		active: Boolean
    });
    return mongoose.model('organizations', schema);
};