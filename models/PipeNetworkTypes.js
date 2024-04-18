const Mongoose = require("mongoose");
const { Schema } = Mongoose;
const { commonMastersConnection } = require("utils/MongooseDBConnection");

const schema = new Schema(
	{
		name: { type: String, required: true, unique: true },
		code: { type: String, required: true, unique: true },
		isDisabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);
schema.index({ name: 1, code: 1 }, { unique: true });

module.exports = {
	schema: schema,
	PipeNetworkTypesModel: commonMastersConnection.model("pipe_network_types", schema),
};
