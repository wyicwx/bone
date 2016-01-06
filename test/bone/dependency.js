module.exports = function(buffer, encoding, callback) {
    this.addDependency([
        '~/src/js/hello.js',
        '~/src/css/css.css'
    ]);

    callback(null, buffer);
};