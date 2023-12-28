const path = require('path');
const fs = require('fs');
const { color } = require('@lzwme/fe-utils');
const { Cvocr } = require('..');

//Debug等级
global.debugFlag = 1;

//验证码种类与各自的评估函数
const modeList = {
  slide_match: (ans, rightAns) => ans.minLoc.x === rightAns[0] && ans.maxLoc.x === rightAns[1],
  simplest: (ans, rightAns) => ans.result == rightAns,
  grids_and_equations: (ans, rightAns) => ans.equation.slice(0, 3) == rightAns,
  dots_and_chars: (ans, rightAns) => ans.result == rightAns,
};

(async () => {
  let modeI = 0;
  for (const mode in modeList) {
    const isSlideMatch = mode === 'slide_match';
    const cvocr = new Cvocr(mode);
    console.log(`--- ${++modeI}. ${mode} ---\n`);
    await cvocr.init(4, 2);

    const examplePath = path.join(__dirname, 'case', mode);
    const files = fs.readdirSync(examplePath);
    let rightNum = 0;
    for (let i = 0; i < files.length; i++) {
      const fileName = files[i];
      let rightAns = fileName.slice(0, -path.extname(files[i]).length);
      let img1 = path.join(examplePath, fileName);
      let originalImg;

      if (isSlideMatch) {
        if (!fileName.startsWith('slider-')) continue;
        const idx = fileName.match(/-(\d)/)?.[0];
        if (!idx) continue;
        originalImg = path.join(examplePath, `original${idx}.png`);
        const m = fileName.match(/_(\d+)x(\d+)/);
        rightAns = [+m?.[1], +m?.[2]];
      }

      let ans = await cvocr.recognize(img1, originalImg);
      let judge = modeList[mode](ans, rightAns);
      if (judge) rightNum++;
      console.log(`[${color.magenta(mode)}]ans:`, ans, color.cyan(fileName));
      console.log(judge ? color.green('Right!') : color.red(`Wrong! | the rightAns is : ${rightAns}`), '\n');
    }

    console.log(`${color.magentaBright(mode)}'s score: ${((rightNum / files.length) * 100).toFixed(1)}% (${rightNum}/${files.length})\n`);
  }
  process.exit(0);
})();
