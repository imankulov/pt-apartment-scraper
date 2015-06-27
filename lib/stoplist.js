var through2 = require("through2"),
    config = require("config"),
    slug = require("slug");


var STOP_WORDS = config.get("STOP_WORDS") || [],
    STOP_SLUGS = [];

STOP_WORDS.forEach(function(w) {
    STOP_SLUGS.push(slug(w, {lower: true}));
});


/**
 * StopListFilter removes from the input stream all entries having stop words in their contents
 */
StopListFilter = through2.ctor(
    {objectMode: true},

    function(chunk, enc, cb) {
        if (!isChunkInStopList(chunk, STOP_SLUGS)) {
            this.push(chunk);
        }
        cb();
    }
);

function isChunkInStopList(chunk, stopSlugs) {
    var slugs = [];

    // collect slugs from the chunk
    slugs = slugs.concat(chunk.labels || []);
    slugs = slugs.concat(slugifyText(chunk.text));
    slugs = slugs.concat(slugifyText(chunk.tagline));

    // check for labels validity
    return slugs.some(function(s) {return stopSlugs.indexOf(s) != -1});
}

function slugifyText(string) {
    var ret = [],
        chunks = (string || "").toString().trim().split(/\s+/);
    chunks.forEach(function(chunk) {
        if (chunk) {
            ret.push(slug(chunk, {lower: true}));
        }
    });
    return ret;
}


exports.isChunkInStopList = isChunkInStopList;
exports.StopListFilter = StopListFilter;

