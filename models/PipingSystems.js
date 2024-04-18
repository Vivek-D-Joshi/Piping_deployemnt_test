const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const schema = new Schema(
	{
		projectId: { type: Schema.ObjectId, require: true, ref: "projects" },
		name: { type: String, require: true },
		initials: { type: String, require: true },
		color: { type: String },
		pipeTypes: { type: Object },
		pipingNetwork: { type: Object },
		genericPipeSystem: { type: Object },
		genericPipeSizes: { type: [Object] },
		isDisabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);
schema.index(
	{
		projectId: 1,
		name: 1,
		initials: 1,
		color: 1,
		pipeTypes: 1,
		pipingNetworkName: 1,
		genericPipeSystemName: 1,
		genericPipeSizes: 1,
	},
	{ unique: true }
);

module.exports = {
	schema: schema,
	PipingSystemsModel: Mongoose.model("piping_systems", schema),
};
