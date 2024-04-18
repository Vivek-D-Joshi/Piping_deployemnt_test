const { logger } = require("utils");

let FILTER_ERROR_STRING = "_NULL_";
module.exports = function ({ Services, config }) {
	return {
		parseFilterObject: function ({ queryFilter, collectionName, include, exclude, body }) {
			let filterObject = [];
			let globalFilterObj = { $or: [] };
			let conf = require(config.rootDir + "/config/validatorConfigs/" + collectionName);

			// keep any specific query field objects which are explicitly given
			if (include.length) conf = conf.filter((e) => include.includes(e.key));
			// remove any specific query field objects which are explicitly given
			if (exclude.length) conf = conf.filter((e) => !exclude.includes(e.key));

			for (let obj of conf) {
				// check if global filter search text exists
				if (obj.globalSearch && queryFilter.searchText) {
					let searchRegex = Services.DataTypeConverters.convertToRegex(queryFilter.searchText);
					if (searchRegex !== FILTER_ERROR_STRING) {
						globalFilterObj["$or"].push({
							[obj.searchKey]: searchRegex.transformedValue,
						});
					}
				}

				// if searchKey doesn't exist or if the key has value undefined then skip loop
				if (!obj.searchKey || typeof queryFilter[obj.key] == "undefined") continue;

				let dataType = obj.isObjectId == true ? "ObjectId" : obj.dataType;
				let customKey = obj.searchKey;
				let convertResult;

				switch (dataType) {
					case "number": {
						convertResult = body
							? { transformedValue: queryFilter[obj.key], parsedValue: queryFilter[obj.key] }
							: Services.DataTypeConverters.convertToNumber(queryFilter[obj.key]);
						break;
					}
					case "string": {
						convertResult = Services.DataTypeConverters.convertToRegex(queryFilter[obj.key]);
						break;
					}
					case "date": {
						convertResult = Services.DataTypeConverters.convertToDate(
							queryFilter[obj.key],
							obj.advanceCompare
						);
						if (convertResult !== FILTER_ERROR_STRING && obj.advanceCompare) {
							convertResult = {
								transformedValue: {
									[obj.advanceCompare]: convertResult.transformedValue,
								},
								parsedValue: convertResult.parsedValue,
							};
						}
						break;
					}
					case "array": {
						convertResult = body
							? { transformedValue: { $in: queryFilter[obj.key] }, parsedValue: queryFilter[obj.key] }
							: Services.DataTypeConverters.convertToArray(queryFilter[obj.key]);
						break;
					}
					case "ObjectId": {
						convertResult =
							obj.parseNull == true && (!queryFilter[obj.key] || queryFilter[obj.key] == null)
								? { transformedValue: null, parsedValue: queryFilter[obj.key] }
								: Services.DataTypeConverters.convertToObjectId(queryFilter[obj.key]);
						break;
					}
					case "arrayOfObjectId": {
						// doesnt work with body
						convertResult = Services.DataTypeConverters.convertToArrayOfObjectId(queryFilter[obj.key]);
						break;
					}
					case "boolean": {
						convertResult = body
							? { transformedValue: queryFilter[obj.key], parsedValue: queryFilter[obj.key] }
							: Services.DataTypeConverters.convertToBoolean(queryFilter[obj.key]);
						break;
					}
				}

				if (convertResult !== FILTER_ERROR_STRING) {
					if (
						obj.hasOwnProperty("transformQueryParamFunc") &&
						typeof obj.transformQueryParamFunc === "function"
					) {
						let result = obj.transformQueryParamFunc(convertResult, { Services });
						if (result) {
							convertResult = result;
						} else {
							logger.error(`Error while executing transformQueryParamFunc for key ${obj.key}`);
						}
					}
					if (customKey.indexOf("|") > -1) {
						let keys = customKey.split("|");
						let customFilter = keys.reduce((acc, cv) => {
							acc.push({ [cv]: convertResult.transformedValue });
							return acc;
						}, []);

						filterObject.push({
							$or: customFilter,
						});
					} else {
						filterObject.push({
							[customKey]: convertResult.transformedValue,
						});
					}
					queryFilter[obj.key] = convertResult.parsedValue;
				}
			}

			if (globalFilterObj["$or"].length) {
				if (filterObject.length === 0) {
					return { filter: { $and: [globalFilterObj] }, filterJsonObject: queryFilter };
				}
				return {
					filter: { $and: [{ $and: filterObject }, globalFilterObj] },
					filterJsonObject: queryFilter,
				};
			}

			return {
				filter: filterObject.length === 0 ? {} : { $and: filterObject },
				filterJsonObject: queryFilter,
			};
		},

		parse: function ({ queryParams, collectionName, exclude = [], include = [], body = false }) {
			delete queryParams.pageSize;
			delete queryParams.pageNo;
			return Services.QueryParamsHelper.parseFilterObject({
				queryFilter: queryParams,
				collectionName,
				exclude,
				include,
				body,
			});
		},
	};
};
