var assert = require("assert"),
    fs = require("fs"),
    path = require("path"),
    util = require("util"),
    stream = require("stream"),
    CustoJustoScraper = require("../lib/custo_justo").CustoJustoScraper,
    ImovirtualScraper = require("../lib/imovirtual").ImovirtualScraper,
    OLXScraper = require("../lib/olx").OLXScraper,
    SapoScraper = require("../lib/sapo").SapoScraper;

/**
 * Helper function to get the mock filename
 */
function getFixturePath(filename) {
    return path.join(__dirname, "fixtures", filename);
}


/**
 * An endpoint to test scrapers. Just collects the data.
 */
function TestEndpoint() {
    stream.Writable.call(this, {objectMode: true});
    this.itemsBuffer = [];
}

util.inherits(TestEndpoint, stream.Writable)
TestEndpoint.prototype._write = function(chunk, encoding, callback) {
    this.itemsBuffer.push(chunk);
    callback();
};


describe('CustoJustoScraper', function() {
   it('scrapes HTML', function(done) {
       var endpoint = new TestEndpoint();
       endpoint.on('finish', function() {
           var item = endpoint.itemsBuffer[0];
           assert.deepEqual(item, require(getFixturePath("custojusto.json")));
           done();
       });
       fs.createReadStream(getFixturePath("custojusto.html")).pipe(new CustoJustoScraper()).pipe(endpoint);
   });
});

describe('ImovirtualScraper', function() {
   it('scrapes HTML', function(done) {
       var endpoint = new TestEndpoint();
       endpoint.on('finish', function() {
           var item = endpoint.itemsBuffer[0];
           assert.deepEqual(item, require(getFixturePath("imovirtual.json")));
           done();
       });
       fs.createReadStream(getFixturePath("imovirtual.html")).pipe(new ImovirtualScraper()).pipe(endpoint);
   });
});


describe('OLXScraper', function() {
    it('scrapes HTML', function(done) {
        var endpoint = new TestEndpoint();
        endpoint.on('finish', function() {
            var item = endpoint.itemsBuffer[0];
            assert.deepEqual(item, require(getFixturePath("olx.json")));
            done();
        });
        fs.createReadStream(getFixturePath("olx.html")).pipe(new OLXScraper()).pipe(endpoint);
    });
});


describe('Sapo.pt scraper', function() {
    it('scrapes HTML', function(done) {
        var endpoint = new TestEndpoint();
        endpoint.on('finish', function() {
            var item = endpoint.itemsBuffer[0];
            assert.deepEqual(item, require(getFixturePath("sapo.json")));
            done();
        });
        fs.createReadStream(getFixturePath("sapo.html")).pipe(new SapoScraper()).pipe(endpoint);
    });
});
