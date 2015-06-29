var _ = require('underscore');

var projects = {};

function Project(name, options) {
	this.name = name;
	this.options = options;
	this.parsed = null;
}

Project.prototype.parse = function() {
	var self = this;
	var bone = require('../index.js');

	if(!this.parsed) {
		var rawFile, result = [];
		if(_.isString(this.options)) {
			rawFile = [this.options];
		} else if(_.isArray(this.options)) {
			rawFile = this.options;
		} else if(_.isObject(this.options)) {
			// todo
		} else {
			return [];
		}

		_.each(rawFile, function(file) {
			file = bone.fs.pathResolve(file);
			result = result.concat(bone.fs.search(file));
		});
		result = _.filter(result, function(file) {
			return bone.fs.existFile(file);
		});

		result = _.uniq(result);
		this.parsed = result;
	}
	return this.parsed;
};

exports.project = function(name, option) {
	if(projects[name]) {
		return projects[name].parse();
	} else if(option) {
		var project = new Project(name, option);
		projects[name] = project;
	}
};

exports.refresh = function() {
	_.each(projects, function(project) {
		project.parsed = null;
	});
};