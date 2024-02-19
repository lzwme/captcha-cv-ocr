FROM urielch/opencv-nodejs:latest As production
WORKDIR /usr/src/app
# RUN npm install @lzwme/captcha-cv-ocr

COPY codes codes
COPY lib lib
COPY package.json .
COPY index.js .
# COPY eng.traineddata .
ADD https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata .

ENV NODE_PATH /usr/local/lib/node_modules
ENV NODE_ENV production
ENV PORT 3600

EXPOSE 3600/tcp

RUN npm i --omit dev --omit peer --no-package-lock

ENTRYPOINT [ "node", "./index.js" ]
# COPY test ./
# COPY data ../data
# RUN npm remove @u4/opencv4nodejs
# RUN npm install
# RUN npm link @u4/opencv4nodejs
# docker run -it --rm urielch/opencv-nodejs:test npm run test
