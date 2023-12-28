"use strict";  

const path = require("path");
const loadImage = require("./lib/loadImage");
const { logger } = require('./lib/utils');

var modeModule;
global.debugFlag = 0;

class Cvocr {
    constructor(mode = "simplest") {
        try {
            if (global.debugFlag) logger.updateOptions({ levelType: 'debug' });
            logger.debug("Debug Mode On!\n");
            modeModule = require(path.join(__dirname, "codes", mode));
        }
        catch (err) {
            console.error(`no this mode: ${mode}, path: ${path.join(__dirname, "codes", mode)}`);
            console.error(err);
            process.exit(1);
        }
    }
    recognize = async (img) => {
        var image = await loadImage(img);
        logger.debug(`image.length: ${image.length}`);
        return await modeModule.recognize(image);
    }
    init = async (config = [{ num: 2 }, { num: 1 }]) => {
        await modeModule.init(config);
    }
}

exports.config = require('./lib/config');
exports.Cvocr = Cvocr;
