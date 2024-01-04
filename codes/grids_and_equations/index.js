const { PSM, OEM } = require('tesseract.js');
const TesseractOcr = require('../../lib/TesseractOcr');
const opencv_cv = require('./opencv_cv2');
const { log } = require('../../lib/utils');

const cv = opencv_cv;

class grids_and_equations {
  #ocrNumber = new TesseractOcr({
    desc: 'number',
    num: 2,
    oem: OEM.TESSERACT_LSTM_COMBINED,
    params: {
      tessedit_char_whitelist: '0123456789',
      tessedit_pageseg_mode: PSM.SINGLE_CHAR,
    },
  });
  #ocrSymbol = new TesseractOcr({
    desc: 'symbol',
    num: 1,
    oem: OEM.TESSERACT_LSTM_COMBINED,
    params: {
      tessedit_char_whitelist: '+-x*/',
      tessedit_pageseg_mode: PSM.SINGLE_CHAR,
    },
  });

  async recognize(image) {
    const timeBegin = Date.now();
    const cvResult = await cv(image);

    log('cv', { result: 'length=' + cvResult.result.length, time: cvResult.time });

    var [a, e, b] = await Promise.all([
      this.#ocrNumber.recognize(cvResult.result[0]),
      this.#ocrSymbol.recognize(cvResult.result[1]),
      this.#ocrNumber.recognize(cvResult.result[2]),
    ]);

    log('a', a, 'e', e, 'b', b);
    var a = parseInt(a.result);
    var b = parseInt(b.result);
    var e = e.result;
    var c = 0;

    if (e == '+') c = a + b;
    if (e == 'x' || e == '*') (e = 'x'), (c = a * b);
    if (e == '-') c = a - b;
    if (e == '/') c = a / b;

    return { result: c, equation: a + e + b + '=?', time: Date.now() - timeBegin };
  }

  async init(config, symbolConfig) {
    await Promise.all([this.#ocrNumber.init(config), this.#ocrSymbol.init(symbolConfig)]);
    return this;
  }
}

module.exports = new grids_and_equations();
