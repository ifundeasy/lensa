module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		username: String,
		name: String,
		phone: String,
		email: String,
		avatar: String,
		gender: String,
		role_id: Number,
		company_id: Number,
		password: String,
		created_date: Date,
		last_login: Date,
		active: Boolean 
    });
    return mongoose.model('internal', schema);
};