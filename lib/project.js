var bone = require('bone');
var _ = require('underscore');

var rawProjects = [];
var projects = {};

function Project(name, files) {
	this.name = name;
	this.containFiles = files;

	rawProjects.push(this);
}

exports.Project = Project;

exports.get = function(name) {
	return projects[name];
}

exports.setup = function() {
	_.each(rawProjects, function(obj) {
		if(_.isString(obj.containFiles)) {
			obj.containFiles = [obj.containFiles];
		} 
		if(!_.isArray(obj.containFiles)) {
			obj.containFiles = [];
		}

		var files = [];

		_.each(obj.containFiles, function(file) {
			file = bone.fs.pathResolve(file);
			files = files.concat(bone.fs.search(file));
		});
		
		projects[obj.name] = files;
	});

	exports.setup = function() {};
}