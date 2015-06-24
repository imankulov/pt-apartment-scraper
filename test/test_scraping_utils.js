var assert = require("assert"),
    cheerio = require("cheerio"),
    su = require("../lib/scraping_utils");


describe('extractTextOnly', function() {
   it('ignores subnodes', function() {
       var $ = cheerio.load('<div>foo<span>bar</span></div>');
       assert.equal('foo', su.extractTextOnly($.root()));
   });
   it('deals with empty contents', function() {
       var $ = cheerio.load('<div><span>bar</span></div>');
       assert.equal('', su.extractTextOnly($.root()));
   });
});
