const path = require('path');
const fs = require('fs');
const { color } = require('@lzwme/fe-utils');
const { Cvocr } = require('..');

//Debug等级
global.debugFlag = 1;

//验证码种类与各自的评估函数
const modeList = {
  simplest: (ans, rightAns) => ans.result == rightAns,
  grids_and_equations: (ans, rightAns) => ans.equation.slice(0, 3) == rightAns,
  dots_and_chars: (ans, rightAns) => ans.result == rightAns,
};

(async () => {
  let modeI = 0;
  for (const mode in modeList) {
    const cvocr = new Cvocr(mode);
    console.log(`--- ${++modeI}. ${mode} ---\n`);
    await cvocr.init(4, 2);

    const examplePath = path.join(__dirname, 'case', mode);
    const files = fs.readdirSync(examplePath);
    let rightNum = 0;
    for (let i = 0; i < files.length; i++) {
      let rightAns = files[i].slice(0, -path.extname(files[i]).length);
      let ans = await cvocr.recognize(path.join(examplePath, files[i]));
      let judge = modeList[mode](ans, rightAns);
      if (judge) rightNum++;
      console.log('ans:', ans);
      console.log(judge ? color.green('Right!') : color.red(`Wrong! | the rightAns is : ${rightAns}`), '\n');
    }

    console.log(`${color.magentaBright(mode)}'s score: ${((rightNum / files.length) * 100).toFixed(1)}% (${rightNum}/${files.length})\n`);
  }
  process.exit(0);
})();
