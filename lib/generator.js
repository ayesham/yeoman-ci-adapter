const yeoman = require('yeoman-environment');
const adapter = require('./adapter');
const pkg = require('../package.json');

function Generator(options = {}) {
	this.options = options;
	this.env = yeoman.createEnv(
		[],
		(options || {}),
		new adapter.CommandlineAdapter(options)
	);
}

Generator.prototype.run = function(answers, cb, subgenerator) {
	const generators = this.env.lookup({
		packagePatterns: pkg.name
	});

	if (!generators || generators.length === 0) {
		return Promise.reject(`${pkg.name} is not installed globally.`);
	}
	const generatorToRun = subgenerator ? generators.find(item => item.namespace.indexOf(subgenerator) !== -1) :  generators[0];
	const rootGenerator = generatorToRun.generatorPath;

	this.generator = this.env.create(rootGenerator, this.options);
	this.promptAnswer(this.generator, answers, cb);

	const generatorPromise = this.generator.run();
	return generatorPromise;
};

Generator.prototype.promptAnswer = function(generator, answers = {}, cb) {
	const promptModule = generator.env.adapter.promptModule;
	const AutoFillPrompt = adapter.AutoFillPrompt;
	Object.keys(promptModule.prompts).forEach(name => {
		promptModule.registerPrompt(name, AutoFillPrompt.bind(AutoFillPrompt, answers, cb));
	});
};

module.exports = Generator;
