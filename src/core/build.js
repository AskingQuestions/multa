const Parser = require("../parser/parser.js");
const File = require("./file.js");
const Rule = require("./rule.js");

/**
 * @class Multa.Build
 */
module.exports = class Build {
	constructor(options) {
		this.config = options;

		this.files = [];
		this.modules = [];

		this.hasFatalError = false;
		this.hasError = false;

		this.displayError = null;

		this.extendedRules = [];
	}

	/**
	 * Extends the current build with new functionality provided by classes.
	 * 
	 * @example
	 * build.extend({
	 * 	type: "rule",
	 * 	class: class MyCustomRule extends Rule { ... },
	 * 	match: (parsed) => parsed.slices[0].value == "custom-rule-selector"
	 * });
	 */
	extend(data) {
		if (data.type == "rule") {
			this.extendedRules.push(data);
		}
	}

	addModule(cls) {
		let inst = new cls(this);
		this.modules.push(inst);

		inst.initialize();
	}

	/**
	 * Parses the file and adds it to the build without any further processing.
	 * 
	 * @param {string} fileAsString - Raw utf-8 string.
	 * @param {path} path - Used for error parser reporting.
	 */
	addFile(fileAsString, path) {
		try {
			let parsed = Parser.parse(fileAsString);
			let file = new File(this, parsed, path);
			this.files.push(file);

			if (file.hadError) {
				this.hadFatalError = true;
				this.displayError = file.errors[0].display;
				throw new Error(this.displayError);
			}
		}catch (pegError) {
			if (!pegError.location)
				throw pegError;

			// Construct a blank file for generating this error.
			let file = new File(this, [], path);

			file.generateError(pegError.name + " " + pegError.message, pegError.location.start.line, pegError.location.start.column);

			this.hadFatalError = true;
			this.displayError = file.errors[0].display;
			throw new Error(this.displayError);
		}
	}

	makeRule(file, parsed) {
		for (let extension of this.extendedRules)
			if (extension.match(parsed))
				return new extension.class(parsed, null, file);

		return new Rule(parsed, null, file);
	}

	process() {
		for (let file of this.files) {
			file.process();
		}
	}

	/**
	 * @param {string} js - Export file path for the javascript component of this multa build. e.g "some/path/file.js"
	 * @param {string} css - Export file path for the javascript component of this multa build. e.g "some/path/file.css"
	 * 
	 * @returns {boolean} true if this export was successful.
	 * 
	 * @example
	 * let build = multaBuilder.build("myfile.multa");
	 * build.export("js.js", "css.css"); // true
	 */
	export(js, css) {
		let output = `:root {\n${this.files.map((file) => file.namespace.export()).join("\n\n")}\n}\n\n${this.files.map((file) => file.export()).join("\n\n")}`;
		console.log(output);
	}
}