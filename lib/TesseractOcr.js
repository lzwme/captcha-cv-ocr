const { createWorker, createScheduler, PSM, OEM } = require('tesseract.js');
const { cpus } = require('node:os');
const {log} = require('./utils');

const defaultWorkerConfig = {
  /** worker 标记。默认为 index 次序 */
  uid: '0',
  /** worker 数量 */
  num: 1, // cpus().length,
  langs: ['eng'],
  oem: OEM.DEFAULT,
  /** workerOptions */
  options: {},
  /** workerParams */
  params: {
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: PSM.DEFAULT,
  },
};

class TesseractOcr {
  #workersNum = 0;
  #workesInitalizedNum = 0;
  #schedulerCache = {};

  constructor(workerConfigList = [{ ...defaultWorkerConfig }]) {
    for (let i = 0; i < workerConfigList.length; i++) {
      const config = {
        ...defaultWorkerConfig,
        ...workerConfigList[i],
      };

      this.#workersNum += config.num;
      if (!config.uid) config.uid = i;

      if (this.#schedulerCache[config.uid] && this.getQueueLen(config.uid) === 0) {
        this.terminate(config.uid);
      }

      this.#schedulerCache[config.uid] = {
        config,
        scheduler: createScheduler(),
      };
    }
  }
  async init(uid) {
    for (const [id, { config, scheduler }] of Object.entries(this.#schedulerCache)) {
      if (uid && uid !== id) continue;

      for (let i = 0; i < config.num; i++) {
        const worker = await createWorker(config.langs || ['eng'], config.oem || OEM.DEFAULT, config.options);
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789',
          tessedit_pageseg_mode: PSM.DEFAULT,
          ...config.params,
        });
        scheduler.addWorker(worker);
        this.#workesInitalizedNum++;
        log(`[OCR][${config.uid}]${this.#workesInitalizedNum}/${this.#workersNum} worker(s) initalized`);
      }
    }
  }
  async recognize(image, uid) {
    const timeBegin = Date.now();
    if (!uid) uid = Object.keys(this.#schedulerCache)[0];
    const item = this.#schedulerCache[uid];
    const ocrResult = await item.scheduler.addJob('recognize', image);

    // 更新了新配置
    if (item !== this.#schedulerCache[uid] && item.scheduler.getQueueLen() === 0) this.terminate(null, item);

    return { result: ocrResult.data.text.replace('\n', ''), time: Date.now() - timeBegin };
  }
  async terminate(uid, item) {
    if (uid || item) {
      if (!item) item = this.#schedulerCache[uid];
      if (item) {
        if (uid) delete this.#schedulerCache[uid];
        this.#workersNum -= item.config.num;
        this.#workesInitalizedNum -= item.scheduler.getNumWorkers();
        await item.scheduler.terminate();
      }
    } else {
      for (const uid in this.#schedulerCache) await this.terminate(uid);
    }
  }
  async getQueueLen(uid) {
    if (uid) return this.#schedulerCache[uid]?.scheduler?.getQueueLen();

    let len = 0;
    for (const d of Object.values(this.#schedulerCache)) len += d.scheduler.getQueueLen();
    return len;
  }
}

module.exports = TesseractOcr;
