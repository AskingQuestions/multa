const Namespace = require("./namespace.js");
const Rule = require("./rule.js");

/**
 * @class Multa.File
 */
module.exports = class File {
	/**
	 * @param {Object} parsed - Raw parsed object from the Peg.js parser.
	 * @param {string} id - Identifier used for error generation. This is usually the file path.
	 */
	constructor(parsed, id) {
		this.type = "file";

		this.parsed = parsed;
		this.id = id;

		this.errors = [];

		this.hadError = false;

		this.namespace = new Namespace(this);

		this.rules = [];
		
		for (let rule of this.parsed) {
			this.rules.push(new Rule(rule, null, this));
		}

		this.process();

		console.log(this.rules.map((rule) => rule.flatten()).join(""));
	}

	process() {
		for (let rule of this.rules)
			rule.process();
	}

	generateError(msg, line, column) {
		this.hadError = true;

		this.errors.push({
			message: msg,
			location: {
				id: this.id,
				line: line,
				column: column
			},
			display: msg + " at " + this.id + ":" + line + ":" + column
		});
	}
}