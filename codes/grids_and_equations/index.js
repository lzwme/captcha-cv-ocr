const { PSM, OEM } = require("tesseract.js");
const TesseractOcr = require("../../lib/TesseractOcr");
const opencv_cv = require("./opencv_cv2");
const { log } = require('../../lib/utils');

var ocr;
const cv = opencv_cv;

class grids_and_equations {
    recognize = async (image) => {
        const timeBegin = Date.now();
        const cvResult = await cv(image);

        log("cv", { result: "length=" + cvResult.result.length, time: cvResult.time })

        var a = ocr.recognize(cvResult.result[0], "number");
        var e = ocr.recognize(cvResult.result[1], "symbol");
        var b = ocr.recognize(cvResult.result[2], "number");

        var [a, e, b] = await Promise.all([a, e, b]);
        log("a", a, "e", e, "b", b);
        var a = parseInt(a.result);
        var b = parseInt(b.result);
        var e = e.result;
        var c = 0;
        if (e == '+') c = a + b;
        if (e == 'x') c = a * b;
        return { result: c, equation: a + e + b + "=?", time: Date.now() - timeBegin };
    }

    init = async (config = [{ num: 2 }, { num: 1 }]) => {
        if (ocr) ocr.autoTerminate();
        ocr = new TesseractOcr([{
            uid: 'number',
            num: 2,
            oem: OEM.TESSERACT_LSTM_COMBINED,
            params: {
                tessedit_char_whitelist: '0123456789',
                tessedit_pageseg_mode: PSM.SINGLE_CHAR,
            },
            ...config[0]
        }, {
            uid: 'symbol',
            num: 1,
            oem: OEM.TESSERACT_LSTM_COMBINED,
            params: {
                tessedit_char_whitelist: '+x',
                tessedit_pageseg_mode: PSM.SINGLE_CHAR,
            },
            ...config[1]
        }])
        await ocr.init();
    }
}

module.exports = new grids_and_equations();