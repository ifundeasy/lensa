module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		role_id: String,
		category_id: Number,
		active: Boolean
    });
    return mongoose.model('role_category', schema);
};