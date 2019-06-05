/**
 * Used by namespace to hold variables and const definitions.
 * @class Multa.Define
 */
module.exports = class Define {
	constructor(name, value, namespace, context) {
		this.namespace = namespace;
		this.name = name;
		this.value = value;
		this.static = false;
		this.context = context || {};
	}

	toValue() {
		if (this.static) {
			return this.value.value;
		}else{
			return `var(--${this.name})`;
		}
	}
};