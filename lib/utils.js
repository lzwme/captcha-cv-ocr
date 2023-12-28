const { NLogger, color } = require('@lzwme/fe-utils');
const { readdirSync } = require('node:fs');
const { resolve } = require('node:path');

const logger = new NLogger('[CCOCR]', { color });
exports.logger = logger;

exports.log = function log(...msg) {
    logger.debug(...msg);
}

let codesList = [];
function getCodesList() {
    if (codesList.length === 0) codesList = readdirSync(resolve(__dirname, '../codes'));
    return codesList;
}
exports.getCodesList = getCodesList;