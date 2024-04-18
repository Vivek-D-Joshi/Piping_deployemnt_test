const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const ProjectCommandsModelSchema = new Schema(
	{
		uuid: { type: String }, // projects : id
		type: { type: String },
		parent: { type: String }, // can be any parent("uuid")
		projectId: { type: Schema.ObjectId, ref: "projects" },
		projectEditorId: { type: String }, // will always be the the type: "project" uuid | will be null for type project
		props: { type: Object },
		deletedDate: { type: Date },
		isDeleted: { type: Boolean },
	},
	{ timestamps: true }
);

module.exports = {
	schema: ProjectCommandsModelSchema,
	ProjectCommandsModel: Mongoose.model("project_commands", ProjectCommandsModelSchema),
};
