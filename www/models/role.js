module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		name: String,
		created_date: Date
    });
    return mongoose.model('role', schema);
};