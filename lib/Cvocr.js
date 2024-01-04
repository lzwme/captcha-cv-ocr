'use strict';

const path = require('path');
const loadImage = require('./loadImage');
const { logger } = require('./utils');
const { setLogging } = require('tesseract.js');

global.debugFlag = +process.env.DEBUG_FLAG || 0;

class Cvocr {
  #modeModule;
  #isInited = false;
  constructor(mode = 'simplest') {
    try {
      if (global.debugFlag) {
        logger.updateOptions({ levelType: 'debug' });
        if (global.debugFlag > 15) setLogging(true);
      }

      logger.debug('Debug Mode On!\n');
      this.#modeModule = require(path.resolve(__dirname, '../codes', mode));
    } catch (err) {
      console.error(`no this mode: ${mode}, path: ${path.resolve(__dirname, '../codes', mode)}`);
      console.error(err);
      process.exit(1);
    }
  }
  async recognize(...img) {
    if (!this.#isInited) await this.init();
    const images = await Promise.all(img.filter(Boolean).map(d => loadImage(d)));
    logger.debug(
      `image.length:`,
      images.map(d => d?.length)
    );
    return this.#modeModule.recognize(...images);
  }
  async init(...config) {
    await this.#modeModule.init(...config);
    this.#isInited = true;
    return this;
  }
}

module.exports = Cvocr;
