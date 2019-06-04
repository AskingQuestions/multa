const Define = require("./define.js");

/**
 * Handler for all variables and references.
 * 
 * @class Multa.Namespace
 */
module.exports = class Namespace {
	constructor(parent) {
		this.type = "namespace";

		this.parent = null;
		this.file = null;

		if (parent.type == "namespace")
			this.parent = parent;
		else if (parent.type == "file")
			this.file = parent;
		
		this.defines = [];
	}

	register(name, value) {
		name = this.trimName(name);

		let define = new Define(name, value);

		this.defines.push(define);
	}

	resolve(name, context) {
		name = this.trimName(name);

		for (let define of this.defines)
			if (define.name == name)
				return define;
		
		if (this.file)
			this.file.generateError("Unresolved reference '" + name + "'", context);
		
		return null;
	}

	trimName(name) {
		if (name[0] == "@")
			return name.substr(1);
		else
			return name;
	}

	filter(data) {
		if (data[0] == "@")
			return this.resolve(data);
		else
			return data;
	}

	filterValue(value) {
		if (typeof value == "object") {
			return this.filter(value.name);
		}else{
			return this.filter(value);
		}
	}
};