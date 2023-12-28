/*
 * @Author: renxia
 * @Date: 2023-12-28 18:53:57
 * @LastEditors: renxia
 * @LastEditTime: 2023-12-28 19:43:22
 * @Description:
 */
/**
 * 滑块类型验证码匹配
 */

class SlideMatch {
  init() {}
  recognize(sliderImage, originalImage) {
    const cv = require('@u4/opencv4nodejs');
    const sliderMat = cv.imdecode(Buffer.from(sliderImage, 'base64'));
    const originalMat = cv.imdecode(Buffer.from(originalImage, 'base64'));
    const matched = sliderMat.matchTemplate(originalMat, cv.TM_CCOEFF_NORMED);
    const matchedPoints = matched.minMaxLoc();
    return matchedPoints; // .maxLoc.x;
  }
}

module.exports = new SlideMatch();
