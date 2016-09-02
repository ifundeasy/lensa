module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		sop_id: Number,
		reportstatus_id: Number,
		internal_id: Number,
		estimate: Number,
		step: Number,
		active: Boolean
    });
    return mongoose.model('sop_reportstatus', schema);
};