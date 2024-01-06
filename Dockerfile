FROM urielch/opencv-nodejs:latest As production
WORKDIR /usr/src/app
RUN npm install @lzwme/captcha-cv-ocr

COPY codes codes
COPY lib lib
COPY package.json .
COPY index.js .
COPY package.json .
COPY eng.traineddata .

ENV NODE_ENV production
ENV PORT 3600
EXPOSE 3600/tcp

RUN npm i --omit dev --no-package-lock

ENTRYPOINT [ "node", "./index.js" ]
# COPY test ./
# COPY data ../data
# RUN npm remove @u4/opencv4nodejs
# RUN npm install
# RUN npm link @u4/opencv4nodejs
# docker run -it --rm urielch/opencv-nodejs:test npm run test
