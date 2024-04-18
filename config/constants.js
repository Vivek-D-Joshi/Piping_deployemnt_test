/**
 * constants.js
 * this is the file where server wide constants are defined and are referenced
 * using "config.CONSTANTS"
 */
const primaryUnitTypes = { imperial: "imperial", metric: "metric" };
const gridSettings = { line: "line", dots: "dots" };
const primaryUnits = [
	{ fullName: "meters", shorthand: "m" },
	{ fullName: "centimeter", shorthand: "cm" },
	{ fullName: "millimeters", shorthand: "mm" },
	{ fullName: "feet", shorthand: "ft" },
	{ fullName: "inches", shorthand: "in" },
];
const colors = {
	black: "#000000",
	azure: "#007fff",
};

const wallPatterns = ["blank", "solid", "cross", "lines"];

const labelFields = ["Element ID", "Element Type", "Size", "Length", "Elevation", "System Name", "System Type"];

module.exports = {
	primaryUnits,
	primaryUnitTypes,
	gridSettings,
	colors,
	labelFields,
	wallPatterns,
	popplerBinaryPath: process.env.POPPLER_BINARY_PATH,
};
