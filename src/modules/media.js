const Module = require("../core/module.js");
const Rule = require("../core/rule.js");

class MultaMediaRule extends Rule {
	initialize() {
		this.flattens = false;
	}
}

module.exports = class MultaMedia extends Module {
	initialize() {
		this.build.extend({
			type: "rule",
			class: MultaMediaRule,
			match: (parsed) => {
				return parsed.selector.slices.length > 0 && parsed.selector.slices[0].prefix == "@" && parsed.selector.slices[0].value == "media";
			}
		});
	}
};