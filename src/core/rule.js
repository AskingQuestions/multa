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

		this.flattens = true;

		for (let rule of this.parsed.body.rules) {
			this.children.push(new Rule(rule, this, this.file));
		}

		this.initialize();
	}

	initialize() {
		
	}

	process() {
		for (let prop of this.parsed.body.properties) {
			if (prop.name[0] == "@") {
				let define = this.namespace.register(prop.name, this.namespace.filterValue(prop.values[0]));
				if (define.value.type == "query")
					define.static = true;
			}else{
				this.properties.push(new Property(
					this.namespace.filter(prop.name), // Name
					prop.values.map((val) => this.namespace.evaluateExpression(val)).join(" ")
				));
			}
		}

		for (let rule of this.children) {
			rule.process();
		}
	}

	bakeSelector() {
		if (!this.evaluatedSelector) {
			this.evaluatedSelector = this.namespace.evaluateSelector(this.selector);
		}
	}

	flattenSelector(forChild) {
		this.bakeSelector();

		if (forChild && !this.flattens)
			return "";

		let mySelector = this.evaluatedSelector[0] == "&" ? this.evaluatedSelector.substr(1) : " " + this.evaluatedSelector;
		
		return `${this.parent ? this.parent.flattenSelector(true) : ""}${mySelector}`;
	}

	exportNamespace() {
		return this.namespace.export();
	}

	flatten(css) {
		if (this.flattens) {
			return `${this.flattenChildren()}\n\n${this.flattenSelector()} {${this.exportNamespace()}\n${this.exportSets()}\n}`;
		}else{
			return `${this.flattenSelector()} {${this.exportNamespace()}\n${this.exportSets()}\n${this.flattenChildren()}\n}`;
		}
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