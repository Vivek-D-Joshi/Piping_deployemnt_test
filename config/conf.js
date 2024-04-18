/**
 * conf.js
 * this is the main config file and can be accessed through the "config" dependency
 * which is injected in both controllers and middlewares
 */
module.exports = {
	database: { url: process.env.MONGO_URI },
	auth: { secret: process.env.AUTH_SECRET, token_life: process.env.AUTH_TOKEN_LIFE },
	aws: {
		accessKeyId: process.env.AWS_KEY,
		secretAccessKey: process.env.AWS_SECRET,
		bucket: process.env.AWS_BUCKET_NAME,
		region: process.env.REGION,
		ses: { from: { default: "support@buildwise.tech" }, region: process.env.SES_REGION },
	},
};
