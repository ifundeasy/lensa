module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		name: String,
		company_id: Number
    });
    return mongoose.model('reportstatus', schema);
};