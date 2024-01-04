const { OEM, PSM } = require("tesseract.js");
const TesseractOcr = require("../../lib/TesseractOcr");
const sharp_cv = require("./sharp_cv");

let ocr;
const cv = sharp_cv;

class dots_and_chars {
    async recognize(image) {
        const timeBegin = Date.now();
        const cvResult = await cv(image);

        if (debugFlag) {
            let cvDebugInfo = {result: "length=" + cvResult.result.length, time : cvResult.time}
            console.log("cv", cvDebugInfo)
        }

        const charList = await Promise.all(cvResult.result.map(d => ocr.recognize(d)));

        charList.forEach((value, index) => {
            if (['1', 'I'].includes(value.result)){
                console.log(`index: ${index}, char: ${value.result}, w: ${cvResult.marks[index].w}, h: ${cvResult.marks[index].h}, h/w: ${cvResult.marks[index].h/cvResult.marks[index].w}`);
                if (cvResult.marks[index].h/cvResult.marks[index].w < 2.2) value.result = '1'
                  else value.result = 'I';
            }
            if (['0', 'O'].includes(value.result)){
                console.log(`index: ${index}, char: ${value.result}, w: ${cvResult.marks[index].w}, h: ${cvResult.marks[index].h}, h/w: ${cvResult.marks[index].h/cvResult.marks[index].w}`);
                if (cvResult.marks[index].h/cvResult.marks[index].w < 1.1) value.result = 'O'
                  else value.result = '0';
            }
        })

        if (debugFlag) console.log(charList);
        const chars = charList.map((value) => value.result);
        return { result: chars.join(''), time: Date.now() - timeBegin };
    }

    async init(config = { num: 1 }) {
        if (ocr) ocr.terminate();
        ocr = new TesseractOcr({
            num: 1,
            oem: OEM.TESSERACT_LSTM_COMBINED,
            params: {
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                tessedit_pageseg_mode: PSM.SINGLE_CHAR,
            },
            num: 1,
            ...config,
        });
        await ocr.init();
        return this;
    }
}

module.exports = new dots_and_chars();
