const { ObjectId } = require("mongodb");

const hasValue = (field) => {
	return field !== null && typeof field !== "undefined";
};

const isBooleanTrue = (value) =>
	hasValue(value) && (value === "YES" || value === "yes" || value === 1 || value === true);

const isValueExist = (object, value) => {
	let isExist = false;
	if (!hasObjectLength(object) || !hasValue(value)) return false;
	Object.keys(object).forEach((key) => {
		if (object[key] === value) isExist = true;
	});
	return isExist;
};

const isAllContainValue = (object, value) => {
	if (!hasObjectLength(object) || !hasValue(value)) return false;
	return Object.values(object).every((val) => {
		if (val !== value) {
			return false;
		}
		return true;
	});
};

const hasLength = (field) => {
	return field && field.length !== 0 && typeof field === "object";
};

const isArray = (fields) => {
	return hasValue(fields) && hasLength(fields);
};

const isEmpty = (fields) => {
	return !hasValue(fields) || !hasLength(fields);
};

const arrayData = (data) => {
	return !isEmpty(data) ? data : [];
};

const hasObjectLength = (field) => {
	return field && Object.keys(field).length !== 0;
};

const hasTextLength = (string) => {
	if (!string || !hasValue(string) || string.length === 0) {
		return false;
	}

	return true;
};

const hasNumber = (string) => {
	return /\d/.test(string);
};
const isValidObjectId = (id) => {
	if (ObjectId.isValid(id)) {
		if (String(new ObjectId(id)) === id) {
			return true;
		}
		return false;
	}
	return false;
};

module.exports = {
	hasValue,
	isBooleanTrue,
	isValidObjectId,
	isValueExist,
	isAllContainValue,
	hasLength,
	isArray,
	isEmpty,
	arrayData,
	hasObjectLength,
	hasTextLength,
	hasNumber,
};
