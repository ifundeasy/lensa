module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		userRole_id: Number,
		createdDate: Date,
		name: String,
		notes: String,
		active: Boolean 
    });
    return mongoose.model('userTypes', schema);
};