const moment = require("moment-timezone");
let fs = require("fs");
const { ObjectId } = require("mongodb");
const fileSystem = require("fs").promises;
const { hasTextLength } = require("utils/condition");

module.exports = function ({ config, Services }) {
	return {
		/**
		 * Services.Utility.isTextValidDate
		 * check if string text is of valid ISO format
		 */
		hasObjectLength: function (field) {
			return field && typeof field === "object" && Object.keys(field).length !== 0;
		},
		/**
		 * Services.Utility.isTextValidDate
		 * check if string text is of valid ISO format
		 */
		isTextValidDate: function (e) {
			return moment(e, moment.ISO_8601).isValid();
		},

		/**
		 * Services.Utility.escapeStringForRegex
		 * escapes all special characters which can mess up with the regex creation
		 */
		escapeStringForRegex: function (string) {
			return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

		/**
		 * Services.Utility.validateEmail
		 * check if input string text is a valid email
		 */
		validateEmail: (text) => {
			if (!text) return false;
			return /^(([^<>()[\]\\.,:\s@"]+(\.[^<>()[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
				text
			);
		},

		/**
		 * Services.Utility.camelize
		 * To convert any string to camel case
		 */
		camelize: (str) => {
			return str
				.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
					return index === 0 ? word.toLowerCase() : word.toUpperCase();
				})
				.replace(/\s+/g, "");
		},

		/**
		 * Services.Utility.checkIfUrl
		 * checks if the string is a url or no
		 */

		checkIfUrl: (str) => {
			if (!str) return false;
			let regexString =
				/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\\+\\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+\\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\\+~%\\/.\w-_]*)?\??(?:[-\\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
			let globalRegex = new RegExp(regexString, "g");

			return globalRegex.test(str);
		},

		/**
		 * Services.Utility.checkIfValidUUID
		 * checks if the string is a valid uuid
		 */

		checkIfValidUUID: (str) => {
			if (!str) return false;
			let regexString = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			let globalRegex = new RegExp(regexString, "g");

			return globalRegex.test(str);
		},

		parsePageNoAndSize: (query) => {
			let pageNo = query.hasOwnProperty("pageNo") && Number(query.pageNo) > 0 ? Number(query.pageNo) - 1 : 0;
			let pageSize = query.hasOwnProperty("pageSize")
				? Number(query.pageSize)
				: config.CONSTANTS.DEFAULT_GET_REQUEST_PAGE_SIZE;

			return { pageNo, pageSize };
		},

		isValidObjectId: (id) => {
			if (ObjectId.isValid(id)) {
				if (String(new ObjectId(id)) === id) {
					return true;
				}
				return false;
			}
			return false;
		},

		checkIfNumberFieldsArr: (field, key, arrayLen, productId) => {
			// check for data types if the key is present
			if (field && Array.isArray(field)) {
				if (field.length != arrayLen) {
					return {
						isValid: false,
						errorMessage: `${key} should be an array of ${arrayLen} numbers ${
							productId ? "for fabricProduct Id: " + productId : "."
						}  `,
					};
				}
				for (let e of field) {
					if (typeof e !== "number")
						return {
							isValid: false,
							errorMessage: `${key} should be an array of ${arrayLen} numbers ${
								productId ? "for fabricProduct Id: " + productId : "."
							}  `,
						};
				}
			} else {
				return {
					isValid: false,
					errorMessage: `${key} should be an array of ${arrayLen} numbers ${
						productId ? "for fabricProduct Id: " + productId : "."
					}  `,
				};
			}
		},
		copyFile: function (tempFile, file) {
			return new Promise((resolve, reject) => {
				tempFile.mv(file, function (err) {
					if (err) {
						console.error(err);
						return reject("Could not copy file");
					}
					return resolve(true);
				});
			});
		},
		parseJSONStrings: function (obj) {
			const jsonRegex = /^\{(?:.|\n)*\}$/;
			for (const key in obj) {
				if (typeof obj[key] === "string" && jsonRegex.test(obj[key])) {
					obj[key] = JSON.parse(obj[key]);
					this.parseJSONStrings(obj[key]);
				}
			}
			return obj;
		},

		getFileName: async function (filepath, name) {
			const files = await fileSystem.readdir(filepath);
			const searchedFiles = files.filter((file) => file.startsWith(name));
			if (searchedFiles.length > 0) {
				return searchedFiles[0];
			} else {
				return null;
			}
		},

		getProjectIdFilter: async function (req) {
			const filterParams = hasTextLength(req?.query?.filter) ? req?.query?.filter : "{}";
			const filter = JSON?.parse?.(filterParams);
			const projectId = filter?.projectId;
			const userId = req.user.role === "admin" ? null : req.user?._id;
			const filterQuery = {
				_id: projectId,
				userId: req.user?._id,
				isDeleted: false,
			};
			if (!userId) {
				delete filterQuery.userId;
			}
			const isUserProject = await Services.Projects.findOne(filterQuery);
			return isUserProject ? { projectId } : { projectId: null };
		},

		validateIds: async function ({ req, res, model }) {
			const { ids } = req.body;
			if (!ids || !Array.isArray(ids) || ids.length === 0) {
				return { success: false, message: "Invalid or empty IDs provided." };
			}
			const userId = req.user.role === "admin" ? null : req.user?._id;
			const filterQuery = {
				userId: req.user?._id,
				isDeleted: false,
			};
			if (!userId) {
				delete filterQuery.userId;
			}
			for (const id of ids) {
				if (!Services.Utility.isValidObjectId(id)) {
					return {
						success: false,
						message: `Invalid id: ${id}.`,
					};
				}
				const data = await model.findOne({ _id: id });
				if (!data) {
					return {
						success: false,
						message: `Cannot find data for id ${id}`,
					};
				}
				filterQuery._id = data?.projectId;
				const isUserProject = await Services.Projects.findOne(filterQuery);
				if (!isUserProject) {
					return {
						success: false,
						message: `Cannot find data for user`,
					};
				}
			}
			return {
				success: true,
				message: `all ids are valid`,
			};
		},
	};
};
