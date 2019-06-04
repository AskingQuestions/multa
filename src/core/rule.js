const Namespace = require("./namespace.js");
const Property = require("./prop.js");

/**
 * Handler for ast --> rule tree --> flat exported css.
 * 
 * @class Multa.Rule
 */
class Rule {
	constructor(parsed, parent, file) {
		this.file = file;
		this.parent = parent;

		this.namespace = new Namespace(this.parent ? this.parent.namespace : this.file.namespace);

		this.selector = parsed.selector;

		this.children = [];
		this.properties = [];

		this.parsed = parsed;

		for (let rule of this.parsed.body.rules) {
			this.children.push(new Rule(rule, this, this.file));
		}
	}

	process() {
		for (let prop of this.parsed.body.properties) {
			if (prop.name[0] == "@") {
				this.namespace.register(prop.name, this.namespace.filterValue(prop.values[0]));
			}else{
				this.properties.push(new Property(
					this.namespace.filter(prop.name), // Name
					prop.values.map((val) => this.namespace.filterValue(val))
				));
			}
		}

		for (let rule of this.children) {
			rule.process();
		}
	}

	flattenSelector() {
		let mySelector = this.selector[0] == "&" ? this.selector.substr(1) : " " + this.selector;
		
		return `${this.parent ? this.parent.flattenSelector() : ""}${mySelector}`;
	}

	flatten(css) {
		return `${this.flattenChildren()}\n\n${this.flattenSelector()} {\n${this.exportSets()}\n}`;
	}

	flattenChildren() {
		return this.children.map((child) => 
			`${child.flatten()}\n`
		).join("");
	}

	exportSets() {
		let properties = [];

		for (let prop of this.properties) {
			properties.push(`\t${prop.export()};\n`);
		}

		return properties.join("");
	}
};

module.exports = Rule;