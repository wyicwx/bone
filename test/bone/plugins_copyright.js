module.exports = function(buffer, encoding, callback) {
    var options = this.options({
        copyright: 'anonymous'
    });
    this.cacheable();
    var copyright = ['/**', ' * @copyright ' + options.copyright, ' */', ''];

    copyright = new Buffer(copyright.join('\n'));

    callback(null, copyright + buffer);
};