const { PSM, OEM } = require("tesseract.js");
const tesseract_ocr = require("../../lib/TesseractOcr");
var ocr;

class simplest {
    recognize = async (image) =>{
        var result = await ocr.recognize(image);
        if (debugFlag) console.log("ocr", result);
        result.result = result.result.slice(0, 4);
        return result;
    }
    init = async (config = [{ num: 1 }]) =>{
        ocr = new tesseract_ocr([{
            params: {
                tessedit_char_whitelist: '0123456789',
                tessedit_pageseg_mode: PSM.DEFAULT,
            },
            num: 1,
            ...config[0],
         }]);
        await ocr.init();
    }
}

module.exports = new simplest();