const Mongoose = require("mongoose");
const { Schema } = Mongoose;
const { projectSettingConnection } = require("utils/MongooseDBConnection");

const OIDCSchema = new Schema(
	{
		token: { type: String, require: true, unique: true },
		userId: { type: String, require: true, ref: "users" },
		scope: { type: String },
		role: { type: String },
		clientId: { type: String, require: true },
	},
	{ timestamps: true }
);

module.exports = {
	schema: OIDCSchema,
	OIDCModel: projectSettingConnection.model("OIDC", OIDCSchema),
};
