const CSSBuilder = require("cssBuilder.js");
const JSBuilder = require("jsBuilder.js");
const Build = require("build.js");

/**
 * @class Multa.Builder
 */
module.exports = class Builder {
	/**
	 * @param {Object} options
	 */
	constructor(options) {
		this.config = Object.merge({

		}, options);
	}

	/**
	 * Compiles a set of multa files into a {@link Multa.Build} environment
	 * 
	 * @param {Buffer[]|string[]} files - Array of buffers or paths.
	 * 
	 * @returns {Multa.Build} The generated build object.
	 * 
	 * Note: build converts buffers into whole strings under the hood.
	 */
	build(files) {
		let build = new Build(this.config);

		for (let file of files) {
			build.addFile(file.toString());
		}

		return build;
	}
};