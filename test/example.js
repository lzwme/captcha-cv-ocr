const path = require('path');
const { getCodesList, Cvocr, logger } = require('../index.js');

(async () => {
  const codesList = getCodesList();
  logger.info('codes:', codesList);

  for (const mode of codesList) {
    logger.info('test for:', mode);
    const cvocr = new Cvocr(mode); // mode 表示验证码的种类
    await cvocr.init(1); //其中的1表示需要启动的 OCR Worker 数（多线程）
    const isSlideMatch = mode === 'slide_match';
    const img = path.join(__dirname, `example/${mode}${isSlideMatch ? '-slider.png' : (mode === 'dots_and_chars' ? '.gif' : '.jpg')}`);
    const img2 = isSlideMatch ? path.join(__dirname, `example/${mode}-original.png`) : undefined;
    const ans = await cvocr.recognize(img, img2); //支持文件地址、Base64、Buffer形式
    logger.log(`[${mode}]ans:`, ans);
  }
  process.exit(0);
})();
