var cheerio = require("cheerio"),
    through2 = require("through2"),
    iconv = require('iconv-lite'),
    slug = require("slug"),
    su = require('./scraping_utils');

/**
 * A Transformer which reads the input from OLX and returns the flow of objects
 */
OLXScraper = through2.ctor(
    {readableObjectMode: true},
    function(chunk, enc, cb) {
        // collecting chunks into a memory
        this.data = this.data || [];
        this.data.push(chunk);
        cb();
    },
    function(cb) {
        // pushing data forward
        var s = iconv.decode(Buffer.concat(this.data || []), 'iso-8859-1'),
            $ = cheerio.load(s),
            container = $("#resultlist"),
            transformer = this;

        container.children("div.results").each(function() {
            var $this = $(this),
                ti = $this.find(".ti"),
                price = su.extractTextOnly($this.find(".price")).trim().split(/\s+/)[0];

            data = {
                text: ti.children("a").attr("title"),
                time: $this.find(".time > .date").text().trim(),
                link: ti.children("a").attr("href"),
                price: price + " €",
                priceInt: parseInt(price),
                location: $this.find(".catloc").text().trim(),
                labels: ["olx"]
            };
            data.id = data.link.split('-').reverse()[0];
            data.labels.push("euro" + data.priceInt);
            data.labels.push(slug(data.location, {lower: true}));
            data.labels.sort();
            transformer.push(data);
        });
        cb();
    }
);

exports.OLXScraper = OLXScraper;
