const { NLogger } = require('@lzwme/fe-utils');

const logger = new NLogger('[CCOCR]');
exports.logger = logger;

exports.log = function log(...msg) {
    logger.debug(...msg);
}
