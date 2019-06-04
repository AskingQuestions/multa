/**
 * Used by namespace to hold variables and const definitions.
 * @class Multa.Define
 */
module.exports = class Define {
	constructor(name, value, namespace, context) {
		this.namespace = namespace;
		this.name = name;
		this.value = value;
		this.context = context || {};
	}
};