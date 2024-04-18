const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const schema = new Schema(
	{
		paperSize: {
			label: { type: String, required: true },
			unit: { type: String, required: true },
			xDim: { type: Number, required: true },
			yDim: { type: Number, required: true },
		},
		titleBlock: {
			createdBy: { type: String },
			companyName: { type: String },
			companyPhone: { type: String },
			companyWebsite: { type: String },
			companyAddress: { type: String },
			date: { type: Date, default: Date.now },
		},
		logo: { type: String },
		projectId: { type: Schema.ObjectId, required: true, unique: true },
	},
	{ timestamps: true }
);

schema.index({ projectId: 1, "titleBlock.companyName": 1 }, { unique: true });

module.exports = {
	schema: schema,
	DrawingSummaryModel: Mongoose.model("drawing_summary_info", schema),
};
