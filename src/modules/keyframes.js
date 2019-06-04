const Module = require("../core/module.js");
const Set = require("../core/set.js");
const Type = require("../core/type.js");

class Keyframes extends Type {
	static register() {
		return {
			rule: `@keyframes <animation|string>`,
			allowed: "root",
			cycle: "end"
		}
	}

	process() {
		this.processChildren();
		this.animation = this.rule.values.animation;
	}

	export(tree, js) {
		let node = tree.root.addNode(`@keyframes ${this.animation}`);
		this.exportChildren(node, js);
	}
}

module.exports = class KeyframesModule extends Module {
	register() {
		return [

		];
	}
};