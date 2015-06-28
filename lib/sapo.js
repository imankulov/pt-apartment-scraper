var cheerio = require("cheerio"),
    through2 = require("through2"),
    iconv = require('iconv-lite'),
    slug = require("slug"),
    re_uuid = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}).html/;


/**
 * A Transformer which reads the input from Sapo and returns the flow of objects
 */
SapoScraper = through2.ctor(
    {readableObjectMode: true},
    function(chunk, enc, cb) {
        // collecting chunks into a memory
        this.data = this.data || [];
        this.data.push(chunk);
        cb();
    },
    function(cb) {
        // pushing data forward
        var s = iconv.decode(Buffer.concat(this.data || []), 'utf-8'),
            $ = cheerio.load(s),
            container = $("#divSearchPageResults"),
            transformer = this;

        container.children('script[type="application/ld+json"]').each(function() {
            var $this = $(this),
                source = JSON.parse($this.text().trim()),
                link = $this.next().children("a").first().attr("href"),
                id = re_uuid.exec(link)[1],
                address = source.availableAtOrFrom.address,
                data = {
                    id: id,
                    text: source.description,
                    link: "http://casa.sapo.pt/" + id + ".html",
                    price: source.price[0],
                    priceInt: parseInt(source.price[0]),
                    location: address.addressLocality + ", "
                            + address.addressRegion,
                    tipologia: source.name,
                    labels: ["sapo"]
                };
            data.labels.push("euro" + data.priceInt);
            data.labels.push(slug(address.addressLocality, {lower: true}));
            data.labels.push(slug(data.tipologia, {lower: true}));
            data.labels.sort();
            transformer.push(data);
        });
        cb();
    }
);

exports.SapoScraper = SapoScraper;
