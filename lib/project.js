var bone = require('../index.js');
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
};

exports.refresh = function() {
	_.each(rawProjects, function(obj) {
		if(_.isString(obj.containFiles)) {
			obj.containFiles = [obj.containFiles];
		}

		var files = [];

		_.each(obj.containFiles, function(file) {
			file = bone.fs.pathResolve(file);
			files = files.concat(bone.fs.search(file, {notFs: true}));
		});

		files = _.filter(files, function(file) {
			if(bone.fs.existFile(file, {notFs: true})) {
				return file;
			}
		});
		
		projects[obj.name] = files;
	});
};