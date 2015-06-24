var cheerio = require("cheerio"),
    through2 = require("through2"),
    iconv = require('iconv-lite'),
    slug = require("slug"),
    su = require('./scraping_utils');

/**
 * A Transformer which reads the input from Imovirtual and returns the flow of objects
 */
ImovirtualScraper = through2.ctor(
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

        container.children("div.new_offerg").each(function() {
            var $this = $(this),
                infoItems = $this.find("div.mainInfoWrapper > div.infoItem"),
                price = su.extractTextOnly(infoItems.eq(0)),
                tipologia = su.extractTextOnly(infoItems.eq(1)),
                area = su.extractTextOnly(infoItems.eq(2));

            data = {
                text: $this.find("h4").attr("title"),
                tagline: $this.find("h5").attr("title"),
                link: $this.find("h4 > a").attr("href"),
                price: price,
                priceInt: parseInt(price),
                tipologia: tipologia,
                area: area,
                areaInt: parseInt(area),
                labels: ["imovirtual"]
            };
            data.id = data.link.split('/').reverse()[1];
            data.labels.push("euro" + data.priceInt);
            data.labels.push(slug(data.tipologia, {lower: true}));
            data.labels.sort();
            transformer.push(data);
        });
        cb();
    }
);

exports.ImovirtualScraper = ImovirtualScraper;
