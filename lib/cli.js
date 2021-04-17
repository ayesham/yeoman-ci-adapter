const path = require('path');
const yargs = require('yargs');
const Generator = require('./generator');

const DEFAULT_OPTIONS = {
	'skip-install': true,
	'skip-cache': true,
	'skip-welcome-message': true,
	silent: false
};

// Remove `help` and `version` property from argv
yargs.version(false);
yargs.help(false);

class CLI {
	constructor(options = {}) {
		this.options = Object.assign({}, DEFAULT_OPTIONS, options);
		this.generator = new Generator(this.options);
		this.schema = this.options.schema || {};
	}

	run(argv) {
		return new Promise((resolve, reject) => {
			const {
				error, value
			} = this.validate(
				this.schema,
				this.parseAnswers(argv)
			);

			if (error) {
				return reject(`ValidationError: ${error.details[0].message}`);
			}

			const promise = this.generator.run(value);
			return promise.then(() => {
				return resolve();
			})
				.catch(err => {
					return reject(`Error: ${err}`);
				});
		});
	}

	parseAnswers(argv) {
		argv = yargs.parse(argv);
		return argv.file && argv.file.indexOf('.json' > -1) ? this.parseFromFile(argv.file) : argv;
	}

	parseFromFile(file) {
		const filePath = path.isAbsolute(file) ? file : path.join(process.cwd, file);
		return require(filePath);
	}

	validate(schema, argv) {
		const result = schema.validate(argv, {
			allowUnknown: true
		});

		return result;
	}
}

module.exports = CLI;
