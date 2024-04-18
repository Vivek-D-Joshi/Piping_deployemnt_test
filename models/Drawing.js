const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const schema = new Schema(
	{
		drawingNo: { type: Number, required: true },
		drawingRefNo: { type: String, required: true, unique: true },
		title: { type: String, required: true },
		floorUUID: { type: String, required: true, ref: "projects.floorList.uuid" },
		isViewEnabled: { type: Boolean, default: false },
		isFrameEnabled: { type: Boolean, default: false },
		drawingInfo: { type: Object, default: {} },
		projectId: { type: Schema.ObjectId, required: true, ref: "projects" },
	},
	{ timestamps: true, minimize: false }
);

schema.index({ title: 1, floorUUID: 1, projectId: 1 }, { unique: true });

module.exports = {
	schema: schema,
	DrawingModel: Mongoose.model("drawing", schema),
};
