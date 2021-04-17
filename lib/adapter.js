const logger = require('yeoman-environment/lib/util/log');
const inquirer = require('inquirer');

function AutoFillPrompt(answers, callback, q) {
	this.answers = answers;
	this.question = q;
	this.callback = callback || (q => q);
}

AutoFillPrompt.prototype.run = function() {
	const answer = this.answers[this.question.name];
	return Promise.resolve(this.callback(answer));
};

function CommandlineAdapter(options) {
	this.options = options || {};
	this.promptModule = inquirer.createPromptModule();

	if (this.options.silent) {
		[
			'write',
			'writeln',
			'ok',
			'error',
			'skip',
			'force',
			'create',
			'invoke',
			'conflict',
			'identical',
			'info',
			'table',
			'diff'
		].forEach(methodName => {
			this.log[methodName] = function() {};
		});
	}
}

CommandlineAdapter.prototype.prompt = function(questions, cb) {
	const promise = this.promptModule(questions);
	promise.then(cb);

	return promise;
};

CommandlineAdapter.prototype.log = logger();

module.exports = {
	CommandlineAdapter: CommandlineAdapter,
	AutoFillPrompt: AutoFillPrompt
};
