const Parser = require("../parser/parser.js");
const File = require("file.js");

/**
 * @class Multa.Build
 */
module.exports = class Build {
	constructor(options) {
		this.config = options;

		this.files = [];

		this.hasFatalError = false;
		this.hasError = false;

		this.displayError = null;
	}

	/**
	 * Parses the file and adds it to the build without any further processing.
	 * 
	 * @param {string} fileAsString - Raw utf-8 string.
	 * @param {path} path - Used for error parser reporting.
	 */
	addFile(fileAsString, path) {
		let parsed = Parser.parse(fileAsString);
		let file = new File(parsed, path);
		this.files.push(file);

		if (file.hadError) {
			this.hadFatalError = true;
			this.displayError = file.errors[0];
			throw new Error(this.displayError);
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

	}
}