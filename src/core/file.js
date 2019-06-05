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
	constructor(build, parsed, id) {
		this.type = "file";

		this.build = build;

		this.parsed = parsed;
		this.id = id;

		this.errors = [];

		this.hadError = false;

		this.namespace = new Namespace(this);

		this.rules = [];
		
		for (let rule of this.parsed.roots) {
			if (rule.type == "rule") {
				this.rules.push(this.build.makeRule(this, rule));
			}else if (rule.type == "property") {
				let define = this.namespace.register(rule.name, this.namespace.evaluateExpression(rule.values[0]));
				if (define.value.type == "query")
					define.static = true;
			}
		}

		//this.process();
	}

	process() {
		for (let rule of this.rules)
			rule.process();
	}

	throwError(msg, line, column) {
		throw new Error(msg + " at " + this.id + ":" + line + ":" + column);
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

	export() {
		return this.rules.map((rule) => rule.flatten()).join("\n\n");
	}
}