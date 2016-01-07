module.exports = function(buffer, encoding, callback) {
    this.addDependency('~/src/plugins/dependency_a.js');

    callback(null, buffer);
};