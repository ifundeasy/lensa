module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		name: String,
		company_id: Number,
		active: Boolean
    });
    return mongoose.model('reportstatus', schema);
};