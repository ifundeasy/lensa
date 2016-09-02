module.exports = function (mongoose) {
    var schema = new mongoose.Schema({
		id: Number,
		report_id: Number,
		sop_reportstatus_id: Number,
		internal_id: Number,
		date: Date
    });
    return mongoose.model('reporthistory', schema);
};