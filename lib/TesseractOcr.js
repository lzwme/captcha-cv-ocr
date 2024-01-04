const { createWorker, createScheduler, PSM, OEM } = require('tesseract.js');
const { assign, Barrier } = require('@lzwme/fe-utils');
const { log } = require('./utils');

/** @type {import('..').OcrOptions} */
const defaultWorkerConfig = {
    desc: '',
  num: 1, 
  langs: ['eng'],
  oem: OEM.DEFAULT,
  options: {},
  params: {
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: PSM.DEFAULT,
  },
  autoClose: 10_000,
};

/** @type { Map<typeof defaultWorkerConfig, { timer?: number; scheduler: ReturnType<createScheduler>; config: typeof defaultWorkerConfig }> } */
const schedulerCache = new Map();
let idx = 0;

class TesseractOcr {
  #workersNum = 0;
  #initalizedWorkersNum = 0;
  #config = defaultWorkerConfig;
  /**
   * @param { Partial<typeof defaultWorkerConfig> } config
   */
  constructor(config) {
    if (config) this.#initScheduler(config);
  }
  #initScheduler(config) {
    if (config && schedulerCache.has(config)) this.terminate(config, 0);
    
    const formatedConfig = assign({ desc: ++idx % 99999999 }, defaultWorkerConfig, config);
    this.#config = config || formatedConfig;

    schedulerCache.set(config, { scheduler: createScheduler(), config: formatedConfig });
    if (config.autoClose) this.terminate(config, +config.autoClose || 10_000);
  }
  /**
   * @param { Partial<typeof defaultWorkerConfig> } config
   */
  async init(config) {
    if (!this.#config || !schedulerCache.has(this.#config)) this.#initScheduler(config);
    
    const cache = schedulerCache.get(this.#config);
    if (config && config !== cache.config) assign(cache.config, config);

    this.#workersNum = cache.config.num = Math.max(1, +cache.config.num || 1);
    const num = cache.config.num - cache.scheduler.getNumWorkers();

    for (let i = 0; i < num; i++) {
      const worker = await createWorker(cache.config.langs || ['eng'], cache.config.oem || OEM.DEFAULT, {
          errorHandler: (errorInfo) => log('[tesseractOcr][error]', errorInfo),
          ...cache.config.options,
      });
      cache.scheduler.addWorker(worker);
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: PSM.DEFAULT,
        ...cache.config.params,
      });
      this.#initalizedWorkersNum++;
      log(`[OCR][${cache.config.desc}]${this.#initalizedWorkersNum}/${this.#workersNum} worker(s) initalized`, cache.config);
    }

    return this;
  }
  async recognize(image) {
    const timeBegin = Date.now();
    if (!this.#config || !schedulerCache.get(this.#config)?.scheduler.getNumWorkers()) await this.init();
    const ocrResult = await schedulerCache.get(this.#config).scheduler.addJob('recognize', image);
    return { result: ocrResult.data.text.replace('\n', ''), time: Date.now() - timeBegin };
  }
  async terminate(cfg = this.#config, internal = 1_000) {
    const cache = schedulerCache.get(cfg);
    if (cache) {
      const barrier = new Barrier();
      let times = 0;
      const waitTerminate = async () => {
        if (cache.timer) clearTimeout(cache.timer);
        if (cache.scheduler.getQueueLen() === 0 || !+internal || times++ > 3) {
            await cache.scheduler.terminate();
            schedulerCache.delete(cfg);
            this.#initalizedWorkersNum = 0;
            barrier.open();
        } else {
            cache.timer = setTimeout(() => waitTerminate(), +internal);
        }
      };
      waitTerminate();
      await barrier.wait();
    }
    return this;
  }
  async getQueueLen() {
    return schedulerCache.get(this.#config).getQueueLen();
  }
}

module.exports = TesseractOcr;
