const { PSM, OEM } = require('tesseract.js');
const TesseractOcr = require('../../lib/TesseractOcr');
let ocr;

class simplest {
  async recognize(image) {
    const result = await ocr.recognize(image);
    if (debugFlag) console.log('ocr', result);
    // result.result = result.result.slice(0, 4);
    return result;
  }
  async init(config) {
    if (ocr) await ocr.terminate();
    ocr = new TesseractOcr({
      params: {
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: PSM.DEFAULT,
      },
      num: 1,
      ...config,
    });
    await ocr.init();
  }
}

module.exports = new simplest();
