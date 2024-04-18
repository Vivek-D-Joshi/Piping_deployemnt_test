const Mongoose = require("mongoose");
const { Schema } = Mongoose;
const { commonMastersConnection } = require("utils/MongooseDBConnection");
const schema = new Schema(
	{
		name: { type: String, unique: true },
		code: { type: String, unique: true },
		unitType: { type: String },
		master_pipes: [{ type: Schema.ObjectId, ref: "master_pipes" }],
		isDisabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);
schema.index({ name: 1, code: 1, unitType: 1 }, { unique: true });
module.exports = {
	schema: schema,
	GenericPipeSystemsModal: commonMastersConnection.model("generic_pipe_systems", schema),
};
