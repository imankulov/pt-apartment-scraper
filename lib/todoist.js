var request = require("request"),
    util = require("util"),
    stream = require("stream"),
    uuid = require("node-uuid"),
    config = require("config");

/**
 * Writable filter pushing data to Todoist
 */
function TodoistWriter() {
    var writer = this;

    stream.Writable.call(this, {objectMode: true});
    this.apiEndpoint = config.get("TODOIST_API_ENDPOINT");
    this.apiToken = config.get("TODOIST_API_TOKEN");
    this.projectId = config.get("TODOIST_PROJECT_ID");
    this.itemsBuffer = [];
    this.on('finish', function() {
        if (this.itemsBuffer.length == 0) {
            return;
        }

        var itemOrder = parseInt(
                (new Date("Jan 1 2020").getTime() - new Date().getTime()) / 1000
            ),
            labelsMap = {},
            commands = [],
            i = 0;

        // step 1: collect all labels, and add labels to every item
        this.itemsBuffer.forEach(function(item) {
            item.labels.forEach(function(label) {
                labelsMap[label] = uuid.v4();
            });
        });

        // step 2: generate commands for all labels
        for (var labelName in labelsMap) {
            commands.push({
                type: 'label_add',
                temp_id: labelsMap[labelName],
                uuid: uuid.v4(),
                args: {
                    name: labelName
                }
            })
        }
        // step 3: generate commands for items
        this.itemsBuffer.forEach(function(item) {
            var text = item.text.replace(/[()]/g, '/'),
                labelIds = [];
            item.labels.forEach(function(label) {
                labelIds.push(labelsMap[label]);
            });
            commands.push({
                type: 'item_add',
                uuid: uuid.v4(),
                temp_id: uuid.v4(),
                args: {
                    item_order: itemOrder + (i++),
                    project_id: writer.projectId,
                    content: item.link + ' (' + text + ')',
                    labels: labelIds
                }
            })
        });
        // step 4: perform sync
        this.sync(commands);
    })
}
util.inherits(TodoistWriter, stream.Writable)
TodoistWriter.prototype._write = function(chunk, encoding, callback) {
    this.itemsBuffer.push(chunk);
    callback();
};


TodoistWriter.prototype.sync = function(commands, cb) {
    var form = {
        token: this.apiToken,
        commands: JSON.stringify(commands)
    };
    request.post(this.apiEndpoint, {form: form}, function(error, response, body) {
        cb && cb();
    });
};


exports.TodoistWriter = TodoistWriter;
