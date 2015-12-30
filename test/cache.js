'use strict';
var assert = require('assert');
var bone = require('../index.js');
var cache = require('../lib/cache.js');

bone.status.test = true;
bone.status.watch = true;
describe('bone.cache', function() {
    it('set without parameters or 1 parameter only, return false', function() {
        var ret1 = cache.set();
        var ret2 = cache.set('file.js');
        if (ret1 == false && ret2 == false) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    it('set non-string parameter, return false', function() {
        var ret = cache.set({}, {});

        if (ret == false) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    it('set second parameter is non-stream, return false', function() {
        var ret = cache.set('file.js', {});

        if (ret == false) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    it('set buffer to cache', function() {
        var buffer = new Buffer('setBufferToCache');
        cache.set('setBufferToCache.js', buffer);

        if (cache.get('setBufferToCache.js').toString() != 'setBufferToCache') {
            assert.ok(false);
        }
    });

    it('set buffer twice, set buffer after stream, cache stream result', function() {
        var origin = bone.utils.stream.origin('setStreamBuffer');
        cache.set('setStreamBuffer.js', origin);

        cache.set('setStreamBuffer.js', new Buffer('setStreamBuffer2'));

        origin.on('end', function() {
            var result = cache.get('setStreamBuffer.js').toString();

            if (result == 'setStreamBuffer') {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });
    });

    it('set empty stream', function(done) {
        var origin = bone.utils.stream.origin('');

        cache.set('emptyStream.js', origin);
        origin.on('end', function() {
            process.nextTick(function() {
                var result = cache.get('emptyStream.js')
                if (!result) {
                    done(false);
                } else {
                    done();
                }
            });
        });
    });

    it('get cached buffer', function(done) {
        var buffer = new Buffer('testCacheBuffer');
        var origin = bone.utils.stream.origin(buffer);

        cache.set('getCachedBuffer.js', origin);

        if (cache.get('getCachedBuffer.js') !== false) {
            assert.ok(false);
        }
        origin.on('end', function() {
            var cached = cache.get('getCachedBuffer.js').toString();
            if (cached == 'testCacheBuffer') {
                done();
            } else {
                done(false);
            }
        });
    });

    it('get cache without parameter, return false', function() {
        var cached = cache.get();

        if (cached) {
            assert.ok(false);
        }
    });

    it('clean cached buffer', function() {
        var buffer = new Buffer('cleanCacheBuffer');
        var origin = bone.utils.stream.origin(buffer);

        cache.set('cleanCacheBuffer.js', origin);

        origin.on('end', function() {
            var cached = cache.get('cleanCacheBuffer.js').toString();
            if (cached != 'cleanCacheBuffer') {
                assert.ok(false);
            }

            cache.clean('cleanCacheBuffer.js');

            cached = cache.get('cleanCacheBuffer.js');

            if (cached) {
                assert.ok(false);
            }
        });
    });

    it('clean non-cache file, return false', function() {
        var ret = cache.clean('nonCache');

        if (ret !== false) {
            assert.ok(false);
        }
    });

    it('cached check', function() {
        cache.set('cachedCheck.js', new Buffer('cachedCheck'));

        if (!cache.cached('cachedCheck.js')) {
            assert.ok(false);
        }
    });

    it('all function return false when watch setting disabled.', function() {
        bone.status.watch = false;
        var set = cache.set('watchDisabled.js', new Buffer('123123'));
        var get = cache.get('watchDisabled.js');
        var clean = cache.clean('watchDisabled.js');

        if (set || get || clean) {
            assert.ok(false);
        }
    });
});