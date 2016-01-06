module.exports.act = function(buffer, encoding, callback) {
    var append = new Buffer('|filter');

    callback(null, Buffer.concat([buffer, append]));
};

module.exports.filter = {
    ext: '.invalid'
};