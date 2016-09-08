module.exports = function (mongoose) {

	var procedureSteps = new mongoose.Schema({
		id: Number,
		createdDate: Date,
		name: String,
		description: String,
		stepNumber: Number,
		duration: Number,
		active: Boolean
	});

    var schema = new mongoose.Schema({
		id: Number,
		organizationCategory_id: Number,
		createdDate: Date,
		name: String,
		steps: [procedureSteps],
		description: String,
		active: Boolean 
    });
    return mongoose.model('procedures', schema);
};