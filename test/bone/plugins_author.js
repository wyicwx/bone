module.exports = function(buffer, encoding, callback) {
    var options = this.options();
    this.cacheable();
    var author = ['/**', ' * @author ' + (options.author || 'anonymous'), ' */', ''];

    author = new Buffer(author.join('\n'));
    callback(null, author + buffer);
};