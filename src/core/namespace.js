const Define = require("./define.js");

/**
 * Handler for all variables, references and evaluation.
 * 
 * @class Multa.Namespace
 */
module.exports = class Namespace {
	constructor(parent) {
		this.type = "namespace";

		this.parent = null;
		this.file = null;

		if (parent.type == "namespace") {
			this.parent = parent;
			this.file = this.parent.file;
		}else if (parent.type == "file") {
			this.file = parent;
		}
		
		this.defines = [];
	}

	generateError(msg, line, column) {
		this.file.throwError(msg, line, column);
	}

	export() {
		return this.defines.map((define) =>
			define.static ? '' : `--${define.name}: ${define.value};`
		).join("\n");
	}

	register(name, value) {
		name = this.trimName(name);

		for (let def of this.defines) { // Overwrite old defines.
			if (def.name == name) {
				def.value = value;

				return def;
			}
		}

		let define = new Define(name, value);

		this.defines.push(define);

		return define;
	}

	resolve(name, context) {
		name = this.trimName(name);

		for (let define of this.defines)
			if (define.name == name)
				return define;
		
		if (this.parent)
			return this.parent.resolve(name, context);

		if (context)
		if (this.file)
			this.file.throwError("Unresolved reference '" + name + "'", context.location.start.line, context.location.start.column);
		
		return null;
	}

	trimName(name) {
		if (name[0] == "@")
			return name.substr(1);
		else
			return name;
	}

	filter(data, context) {
		if (data[0] == "@")
			return this.resolve(data, context).toValue() || data;
		else
			return data;
	}

	filterValue(value, workspace) {
		if (typeof value == "object") {
			if (value.type == "number") {
				return value.value + value.unit;
			}else if (value.type == "reference") {
				let resolvedValue = this.resolve(value.name, value);
				
				if (value.call) {
					let appendCall = "";

					if (resolvedValue.function) {
						if (workspace) {
							// TODO: functions
						}else{
							this.generateError("Unable deploy functions here.", value.location.start.line, value.location.start.column);
						}
					}else{
						appendCall = this.evaluateCall({values: value.call});
					}

					return value.name + appendCall;
				}else{
					return resolvedValue.toValue();
					//return `var(--${filteredValue})`;
				}
			}else{
				return value;
			}
		}else{
			return this.filter(value);
		}
	}

	/**
	 * Checks if the type is a pure value.
	 * 
	 * @param {string} type - The raw type (as defined in parser.pegjs)
	 * 
	 * @returns {boolean}
	 */
	isPureValue(type) {
		return type == "number" || type == "string" || type == "reference" || type == "hex" || type == "query";
	}

	/**
	 * Evaluates a parsed expression.
	 * 
	 * @param {Object} expr
	 * @param {Object} workspace - If the expr employs functions a workspace will be needed.
	 * @param {boolean} [nested=falsey]
	 */
	evaluateExpression(expr, workspace, nested) {
		if (typeof expr == "string") {
			return this.filter(expr);
		}else if (this.isPureValue(expr.type)) {
			return this.filterValue(expr, workspace);
		}else if (expr.type != "expression") {
			this.generateError("Internal Error: Trying to evaluate a non expression.", expr.location.start.line, expr.location.start.column);
		}

		if (expr.tails.length == 0) { // calc() is not needed for simple (single term) expressions
			return this.evaluateExpression(expr.head, workspace, false); // Non nested since we did not wrap it in calc()
		}else{
			let head = this.evaluateExpression(expr.head, workspace, true);

			let tails = "";
			
			for (let tail of expr.tails) {
				tails += " " + tail.operator + " " + this.evaluateExpression(tail.value, workspace, true);
			}

			if (nested)
				return `(${head + tails})`;
			else
				return `calc(${head + tails})`;
		}
	}

	evaluateAttribute(attribute, workspace) {
		let attributeJoins = [];
		
		for (let attr of attribute.attributes)
			attributeJoins.push(`${attr.name}=${this.evaluateExpression(attr.value, workspace)}`);

		return `[${attributeJoins.join(", ")}]`;
	}

	evaluateCall(call) {
		/*let joins = [];
		
		for (let val of call.values)
			joins.push(this.evaluateExpression(val));

		return `(${joins.join(", ")})`;*/

		return `(${
			call.values.map((val) =>
				this.evaluateExpression(val)
			).join(", ")
		})`;
	}

	evaluateSelector(sel) {
		if (typeof sel == "string") {
			return sel;
		}else{
			if (sel.type == "expression") {
				return this.evaluateExpression(sel);
			}else if (sel.type == "selector") {
				let out = "";
				
				for (let slice of sel.slices) {
					if (slice.prefix == "whitespace") // Recursive child selector
						slice.prefix = " ";
					
					let postfix = "";

					for (let pf of slice.postfix) {
						if (pf.type == "attribute") {
							postfix += this.evaluateAttribute(pf);
						}else if (pf.type == "call") {
							postfix += this.evaluateCall(pf);
						}
					}

					out += slice.prefix + this.evaluateExpression(slice.value) + postfix;
				}

				return out;
			}
		}
	}
};