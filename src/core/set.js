/**
 * A set encapsulates 
 * @class Multa.Set
 */
module.exports = class Set {
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}

	export() {
		return `${this.name}: ${this.value}`;
	}
};