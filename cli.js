const fs = require("fs");
const program = require('commander');
const Multa = require("./");
const path = require("path");
const { exec } = require('child_process');

program
	.version('1.0.0')
	.command('generate <file> <output_dir>')
	.description('...')
	.action(function (file, output, cmd) {
		let builder = new Multa.Builder();
		builder.addModule(path.resolve("./src/modules/media.js"));

		try {
			let build = builder.build([file]);
			build.process();
			build.export(output + "/js.js", output + "/css.css");
		}catch (e) {
			console.log(e);
		}
	});

program.parse(process.argv);