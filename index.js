"use strict";  

const path = require("path");
const loadImage = require("./lib/loadImage");
const { logger, getCodesList } = require('./lib/utils');
const { setLogging } = require("tesseract.js");

global.debugFlag = +process.env.DEBUG_FLAG || 0;

class Cvocr {
    modeModule;
    constructor(mode = "simplest") {
        try {
            if (global.debugFlag) {
                logger.updateOptions({ levelType: 'debug' });
                if (global.debugFlag > 15) setLogging(true);
            }

            logger.debug("Debug Mode On!\n");
            this.modeModule = require(path.join(__dirname, "codes", mode));
        }
        catch (err) {
            console.error(`no this mode: ${mode}, path: ${path.join(__dirname, "codes", mode)}`);
            console.error(err);
            process.exit(1);
        }
    }
    async recognize (...img) {
        const images = await Promise.all(img.filter(Boolean).map(d => loadImage(d)));
        logger.debug(`image.length:`, images.map(d => d?.length));
        return this.modeModule.recognize(...images);
    }
    async init(config = [{ num: 2 }, { num: 1 }]) {
        await this.modeModule.init(config);
    }
}

module.exports = {
    Cvocr,
    getCodesList,
    logger,
}
