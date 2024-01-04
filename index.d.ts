import { ImageLike, OEM, WorkerOptions, WorkerParams } from 'tesseract.js';
import http from 'http';
import { NLogger } from '@lzwme/fe-utils';

export interface OcrOptions {
  /** 描述，用于日志标记 */
  desc?: string;
  /** worker 数量 */
  num?: number;
  langs?: string[];
  oem?: OEM;
  options?: WorkerOptions;
  params?: WorkerParams;
  autoClose?: boolean | number;
}

export type CodesMode = 'simplest' | 'grids_and_equations' | 'slide_match' | 'dots_and_chars';

export class Cvocr {
    constructor(mode: CodesMode);
    init(ocrConfig: OcrOptions, symbolOcrConfig?: OcrOptions): Promise<Cvocr>;
    recognize<T = any>(img: ImageLike, originalImage?: ImageLike): Promise<T>;
}

export function createServer({ port, baseDir }?: {
    port: any;
    baseDir?: string | undefined;
}): Promise<http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>>;

export function getCodesList(): any[];

export const logger: NLogger;
