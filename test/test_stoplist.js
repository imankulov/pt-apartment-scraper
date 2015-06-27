var assert = require("assert"),
    isChunkInStopList = require("../lib/stoplist").isChunkInStopList;


describe('isChunkInStopList', function() {
    it('tests labels', function() {
        assert(isChunkInStopList({labels: ['foo', 'bar']}, ['foo']));
        assert(!isChunkInStopList({labels: ['bar', 'baz']}, ['foo']));
    });
    it('tests text', function() {
        assert(isChunkInStopList({text: 'The Foo value'}, ['foo']));
        assert(!isChunkInStopList({text: 'The Bar value'}, ['foo']));
    });
    it('tests tagline', function() {
        assert(isChunkInStopList({tagline: 'The Foo value'}, ['foo']));
        assert(!isChunkInStopList({tagline: 'The Bar value'}, ['foo']));
    });
    it('passes empty object', function() {
        assert(!isChunkInStopList({}, ['foo']));
    });

});
