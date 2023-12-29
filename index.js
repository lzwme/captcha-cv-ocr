'use strict';

const { logger, getCodesList } = require('./lib/utils');
const Cvocr = require('./lib/Cvocr');
const { createServer } = require('./lib/createServer');

global.debugFlag = +process.env.DEBUG_FLAG || 0;

module.exports = {
  Cvocr,
  createServer,
  getCodesList,
  logger,
};

if (require.main === module) createServer();
