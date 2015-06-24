/**
 * A function to extract just the plaintext part of the node,
 * ignoring the text in all submodules
 */
function extractTextOnly(node) {
    return node.clone().children().remove().end().text();
}


exports.extractTextOnly = extractTextOnly;
