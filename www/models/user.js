module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		username: String,
		name: String,
		phone: String,
		email: String,
		birthdate: Date,
		avatar: String,
		gender: String,
		password: String,
		created_date: Date,
		last_login: Date,
		verified: Boolean,
		active: Boolean 
    });
    return mongoose.model('user', schema);
};