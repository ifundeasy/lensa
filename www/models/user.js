module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		username: String,
		name: String,
		role_id: Number,
		password: String,
		created_date: Date,
		last_login: Date 
    });
    return mongoose.model('user', schema);
};