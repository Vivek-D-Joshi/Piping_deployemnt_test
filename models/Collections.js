const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const schema = new Schema(
	{
		label: { type: String, required: true },
		isDefault: { type: Boolean, required: true, default: false },
		projectId: { type: Schema.ObjectId, ref: "projects", required: true },
		projectCommands: [
			{
				uuid: { type: String },
				type: { type: String },
				parent: { type: String },
				projectEditorId: { type: String },
				props: { type: Object },
			},
		],
	},
	{ timestamps: true }
);

schema.index({ label: 1, projectId: 1 }, { unique: true });

module.exports = {
	schema: schema,
	CollectionModel: Mongoose.model("collection", schema),
};
