/**
 * @class Multa.Node
 * 
 * @property {Multa.Node} parent - Reference to this parent node.
 * @property {Multa.Node} root - Reference to the top level node in this tree.
 * @property {string} selector - The selector used to export this node and its children
 */
module.exports = class Node {
	constructor(selector, parent) {
		this.parent = parent;
		this.root = this.parent.root || this.parent;

		this.selector = selector;
		
		this.children =  [];
		this.sets = [];
		this.properties = [];
	}

	flattenSelector() {
		let mySelector = this.selector[0] == "&" ? this.selector.substr(1, -1) : " " + this.selector;
		
		return `${this.parent ? this.parent.flattenSelector() : ""}${mySelector}`;
	}

	flatten(css) {
		return `${this.flattenChildren()}\n\n${this.flattenSelector()} {\n${this.exportSets()}\n}`;
	}

	exportSets() {
		let properties = [];

		for (let prop of this.properties) {
			properties.push(`\t${prop.export()};\n`);
		}

		return properties.join("");
	}

	addNode(selector) {
		
	}
};