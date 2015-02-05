var _ = require('underscore');
var stream = require('akostream');

var utils = _.extend({}, _, {stream: stream});

module.exports = utils;