/**
 * @class Multa.File
 */
module.exports = class File {
	/**
	 * @param {Object} parsed - Raw parsed object from the Peg.js parser.
	 * @param {string} id - Identifier used for error generation. This is usually the file path.
	 */
	constructor(parsed, id) {
		this.parsed = parsed;
		this.id = id;

		this.errors = [];

		this.hadError = false;
	}

	generateError(msg, line, column) {
		this.hadError = true;

		this.errors.push({
			message: msg,
			location: {
				id: this.id,
				line: line,
				column: column
			}
		});
	}
}