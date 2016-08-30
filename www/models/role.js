module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		company_id: Number,
		name: String,
		created_date: Date,
		active: Boolean
    });
    return mongoose.model('role', schema);
};