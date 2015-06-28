var request = require("request"),
    config = require("config"),
    RedisFilter = require("./lib/redis_filter").RedisFilter,
    TodoistWriter = require("./lib/todoist").TodoistWriter,
    CustoJustoScraper = require("./lib/custo_justo").CustoJustoScraper,
    ImovirtualScraper = require("./lib/imovirtual").ImovirtualScraper,
    OLXScraper = require("./lib/olx").OLXScraper,
    SapoScraper = require("./lib/sapo").SapoScraper,
    StopListFilter = require("./lib/stoplist").StopListFilter;

function scrapeAll() {
    var requestOpts = {
        headers: {
            "User-Agent": "pt-apartment-scraper (https://github.com/imankulov/pt-apartment-scraper/)"
        }
    }
    request(config.get("CUSTO_JUSTO_URL")).pipe(new CustoJustoScraper())
        .pipe(new StopListFilter()).pipe(new RedisFilter()).pipe(new TodoistWriter());
    request(config.get("IMOVIRTUAL_URL")).pipe(new ImovirtualScraper())
        .pipe(new StopListFilter()).pipe(new RedisFilter()).pipe(new TodoistWriter());
    request(config.get("OLX_URL")).pipe(new OLXScraper())
        .pipe(new StopListFilter()).pipe(new RedisFilter()).pipe(new TodoistWriter());
    request(config.get("SAPO_URL"), requestOpts).pipe(new SapoScraper())
        .pipe(new StopListFilter()).pipe(new RedisFilter()).pipe(new TodoistWriter());
}

exports.scrapeAll = scrapeAll;
