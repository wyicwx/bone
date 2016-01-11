'use strict';
var assert = require('assert');
var log = require('../lib/log.js');
var bone = require('../index.js');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Data = require('../lib/data.js');

bone.status.test = true;
bone.status.watch = true;
describe('bone.log', function() {
    it('show log normal', function() {
        log('show log normal');
        if (Data.logInfo.pop().indexOf('show log normal') == -1) {
            assert.ok(false);
        }
    });

    it('show info log normal', function() {
        log.info('show info log normal');
        if (Data.logInfo.pop().indexOf('show info log normal') == -1) {
            assert.ok(false);
        }
    });

    it('show warn log normal', function() {
        log.warn('show info warn normal');
        if (Data.logInfo.pop().indexOf('show info warn normal') == -1) {
            assert.ok(false);
        }
    });

    it('show throw error log in test mode', function() {
        assert.throws(function() {
            log.error('show info error normal');
        });
    });

    it('show debug log normal', function() {
        bone.status.debug = true;
        log.debug('show info debug normal');
        if (Data.logInfo.pop().indexOf('show info debug normal') == -1) {
            assert.ok(false);
        }
        bone.status.debug = false;
    });
});