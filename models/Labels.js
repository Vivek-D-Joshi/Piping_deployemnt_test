const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const schema = new Schema(
	{
		label: { type: String, required: true },
		fontSize: { type: String, default: "11px" },
		projectId: { type: Schema.ObjectId, required: true, ref: "projects" },
		lines: [
			{
				prefix: { type: String },
				suffix: { type: String },
				field: { type: String, required: true },
			},
		],
	},
	{ timestamps: true }
);

schema.index({ label: 1, projectId: 1 }, { unique: true });

module.exports = {
	schema: schema,
	LabelModel: Mongoose.model("label", schema),
};
