
# @lzwme/captcha-cv-ocr

> 本仓库 Fork 自 [PillarsZhang/captcha-cv-ocr](https://github.com/PillarsZhang/captcha-cv-ocr)

<p align="center"><b>使用 CV (OpenCV) 和 OCR (Tesseract) 进行验证码识别</b></p>

simplest | grids_and_equations | dots_and_chars | slide_match | ...
:-: | :-: | :-: | :-: | :-:
<img src="./test/example/simplest.jpg" height="20" alt="simplest" align=center> | <img src="./test/example/grids_and_equations.jpg" height="20" alt="grids_and_equations" align=center> | <img src="./test/example/dots_and_chars.gif" height="20" alt="dots_and_chars" align=center> | - | ...
2348 | 2x6=? | 7RVO | 滑块匹配 | ...

## 快速入门

### 安装

```bash
# use npm, yarn or pnpm
npm add @lzwme/captcha-cv-ocr
```

因为所需的 OpenCV 支持模块 [@u4/opencv4nodejs](https://github.com/UrielCh/opencv4nodejs) 体积较大，编译过程复杂，请手动安装，或者参考官方的安装指南：

```bash
npm i @u4/opencv4nodejs -g
```

### 用法

#### API 调用示例

```javascript
const path = require("path");
const { Cvocr, getCodesList } = require("captcha-cv-ocr");

// 获取支持的验证码识别类型列表
const codesList = getCodesList();
console.log('codes:', codesList);

(async () => {
    // mode 表示验证码的种类
    let mode = "simplest";
    const cvocr = new Cvocr(mode);
    // 其中的 num: 1 表示需要启动的 OCR Worker 数（多线程）
    await cvocr.init([{ num: 1 }]);
    // 支持文件地址、Base64、Buffer形式
    let ans = await cvocr.recognize("test/example/simplest.jpg"));  
    console.log("ans:", ans)
    process.exit(0);
})()
```
#### 基于 http server 的服务调用

通过启动本地 server 服务的方式，可以提供 http 接口调用能力。示例：

```bash
# 默认启动 3000 端口
node ./node_modules/@lzwme/captcha-cv-ocr/index.js
```

或通过调用 `createServer` 方法自行启动：

```js
const { createServer } = require('@lzwme/captcha-cv-ocr');

createServer({ port: 3000 });
```

然后即可通过 `post` 请求的方式使用。示例（基于 fetch API，可在 Node.js 环境或 chrome 控制台直接调用）：

```js
async function httpOcrTest() {
    const body = {
        mode: 'simplest',
        // 验证码图片
        base64: 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUADwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDtNVmn8t5fIluBGGdvJ/fSHHIAPc+n1rlLbXtbt7rTP7Z0+3t7K/m+zxRxEpNCxICeZng+/f1x0rtNVtzp1pJfSXCGytjJxKScBA+ePwNee6f4i0jXNat575w5MoisdOETfI3AEj4GC57DJC/XmprR1SZtGkmtrnZat9tjhA0tEkkJIaWSTMcWPXHOfwqHR9Se+tDDMY0nilaCRwuBlO4Oeh9xTNbns4I4PtUL/YLgMkkzE/uhjgYAJIJyMjFReEovNmvfsJl/soMotyrcA4+fAbnGf1zVKEeT3kc/JFS0Kut6/LpurafYWM0U0k08cc7MN4hDngdOCeT+HStTWtTn0vTJ9Qm82URkEeVIQCScdjxzjtXFarpeu6e2ntdnTLie41KJ/Oy5eSXnYH6fIB2GMV1/iFb5vC1wLeKQ37QBJVWMlOf9ZsyemN+O/TvXR7OklFIil70nchsdR1ODVbe28SW8Mj3isbdkWSQjYMkYZhwQeue3vXolheRfZI/OjnVscCO3ZVx2wPm7Y715d4ZXSx4m06XwqY/LWOVL2VhKAAQPLyWPGW/uc8HPFepxi/8ALX5rTp2Vm/XNVJpPT8jplBJks9nDLEsbplPND49y3P8AM1QubdZrTUFct/o8mxTnJOBkE56ntnriiiipsRLYkjto11Z7dgHhaIuUdVIzv+lTS6XafZf9SORvAPIQ7v4QeAPbp7UUU6YR2KOtWqWNq8sDPjjdG7blbkdc8/rU39l20l4kLhiFAIbPzdW70UVzvc0qbIL3TIreznZXkdM7vLkw46jjJG7H41NY2do9pEzWkGWUE/JRRRFe8zKXwo//2Q==', 
        // slide_match 模式的底图
        originalBase64: '', 
    };
    const result = await fetch('http://localhost:3000/ocr', {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }).then(d => d.json());
    console.log(result);
}
```


### 说明

第三种验证码(`dots_and_chars`)识别改为用 [sharp](https://github.com/lovell/sharp) 和纯 JavaScript 的 CV 算法来实现，方便在树莓派上运行，但效率相比前两者很低。

## 开发

```bash
git clone https://github.com/renxia/captcha-cv-ocr
cd captcha-cv-ocr
npm install
# 约等于安装为全局模块
npm link            
```

### 测试

```bash
npm test
```

### 已支持

simplest | grids_and_equations | dots_and_chars
:-: | :-: | :-:
<img src="./test/example/simplest.jpg" height="20" alt="simplest" align=center> | <img src="./test/example/grids_and_equations.jpg" height="20" alt="grids_and_equations" align=center> | <img src="./test/example/dots_and_chars.gif" height="20" alt="dots_and_chars" align=center>
2348 | 2x6=? | 7RVO

### 新支持

codes下的文件夹对应着不同种类的名字（自行命名），你可以参照已有的模板与API创建新的识别库，来适配其他各种验证码。

### 参考文档与额外说明

- opencv4nodejs
    - Github | https://github.com/justadudewhohacks/opencv4nodejs
    - API | https://justadudewhohacks.github.io/opencv4nodejs/docs/Mat/
- @u4/opencv4nodejs
    - https://github.com/UrielCh/opencv4nodejs
- tesseract.js
    - 主页 | https://tesseract.projectnaptha.com/
    - Github | https://github.com/naptha/tesseract.js
    - API | https://github.com/naptha/tesseract.js#docs
    - 第三种验证码如果进行训练识别效果会更好
- sharp
    - Github | https://github.com/lovell/sharp
    - API | https://sharp.pixelplumbing.com/api-constructor
    - 另外吐槽：只有编辑图像的基础功能，而且体验不是很理想需要绕过bug
- ./lib/fakeOpenCV
    - 个人仿照 OpenCV 重写了一些图像算法

C++ / Python 的 OpenCV 海量资料也非常有帮助， 相应的函数基本都能在 [opencv4nodejs 的 API 文档](https://justadudewhohacks.github.io/opencv4nodejs/docs/Mat/) 里找到。
