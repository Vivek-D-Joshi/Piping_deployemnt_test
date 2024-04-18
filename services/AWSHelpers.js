const { Upload } = require("@aws-sdk/lib-storage"),
	{ S3 } = require("@aws-sdk/client-s3");
const AmazonS3URI = require("amazon-s3-uri");

const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { logger } = require("utils");

module.exports = async function ({ config }) {
	const { accessKeyId, secretAccessKey, region, bucket } = config.aws;
	const s3 = new S3({ credentials: { accessKeyId, secretAccessKey }, region });
	return {
		uploadToS3AndGetUrl: async (filepath, ext, folderPath) => {
			const fileContent = fs.readFileSync(filepath);
			const key = `${folderPath || ""}/${uuidv4()}${ext}`;
			const params = {
				Bucket: bucket,
				Key: key,
				Body: fileContent,
				ACL: "public-read",
			};

			let data = await new Upload({
				client: s3,
				params,
			}).done();
			return data.Location;
		},
		deleteS3Object: async (uri) => {
			const { key } = AmazonS3URI(uri);
			const params = {
				Bucket: bucket,
				Key: key,
			};
			await s3.deleteObject(params, (err, data) => {
				if (err) {
					logger.error(err);
				}
			});
		},
		isS3Url: async (uri) => {
			try {
				const isUrl = AmazonS3URI(uri);
				return true;
			} catch (err) {
				return false;
			}
		},
	};
};
