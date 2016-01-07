module.exports = function(buffer, encoding, callback) {
    this.addDependency([
        '~/src/plugins/dependency_a.js',
        '~/src/plugins/dependency_b.js'
    ]);

    callback(null, buffer);
};