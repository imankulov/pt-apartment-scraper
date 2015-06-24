var cheerio = require("cheerio"),
    through2 = require("through2"),
    slug = require("slug"),
    iconv = require('iconv-lite');

/**
 * A transformer which reads the input stream from CustoJusto and returns the flow of objects
 */
CustoJustoScraper = through2.ctor(
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
            container = $("#dalist"),
            transformer = this;

        container.children("a").each(function() {
            var $this = $(this),
                price = $this.find(".label-price").parent().text().trim().split('\n').reverse()[0];
            data = {
                text: $this.find("h2.words").text().trim(),
                time: $this.find(".time").text().trim().split('\n')[0],
                link: $this.attr("href"),
                price: price,
                priceInt: parseInt(price),
                location: $this.find(".hidden-xs").text().trim(),
                labels: ["custojusto"]
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


exports.CustoJustoScraper = CustoJustoScraper;
