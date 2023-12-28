const path = require("path");
const cco = require("../index.js");

(async () => {
    for (const mode of cco.config.codeTypeList) {
        let cvocr = new cco.Cvocr(mode);  // mode 表示验证码的种类
        await cvocr.init(1);  //其中的1表示需要启动的 OCR Worker 数（多线程）
        let ans = await cvocr.recognize(path.join(__dirname, "example", mode + ".jpg"));  //支持文件地址、Base64、Buffer形式
        console.log(`[${mode}]ans:`, ans);
    }
    process.exit(0);
})()