/**
 * @class Multa.Property
 */
module.exports = class Property {
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}

	export() {
		return `${this.name}: ${this.value}`;
	}
}