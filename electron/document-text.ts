import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { dirname, extname, join, sep } from 'node:path';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 200_000;
type DocumentTextResult = { text: string } | { error: string };

export async function extractDocumentText(input: unknown): Promise<DocumentTextResult> {
  const file = input as { name?: unknown; data?: unknown } | null;
  if (!file || typeof file.name !== 'string' || !(file.data instanceof Uint8Array)) {
    return { error: '文件数据无效，请重新选择。' };
  }
  const extension = extname(file.name).toLowerCase();
  if (!['.docx', '.pdf', '.txt', '.md'].includes(extension)) {
    return { error: '仅支持 DOCX、PDF、TXT 和 Markdown 文件。' };
  }
  if (!file.data.byteLength || file.data.byteLength > MAX_FILE_BYTES) {
    return { error: '文件不能为空，且单份文件不能超过 10 MB。' };
  }
  // Keep parser work off the desktop main thread and bound each import's time and heap.
  return new Promise(resolve => {
    const worker = new Worker(__filename, {
      workerData: { extension, data: file.data },
      resourceLimits: { maxOldGenerationSizeMb: 128 },
    });
    const finish = (result: DocumentTextResult) => {
      clearTimeout(timer);
      resolve(result);
      void worker.terminate();
    };
    const timer = setTimeout(() => finish({ error: '读取超时，请拆分文件后重试。' }), 30_000);
    worker.once('message', finish);
    worker.once('error', () => finish({ error: '无法解析文件，请重新保存文件或拆分后重试。' }));
    worker.once('exit', () => finish({ error: '文件解析未完成，请重新选择。' }));
  });
}

async function parseDocument(): Promise<DocumentTextResult> {
  const { extension, data } = workerData as { extension: string; data: Uint8Array };
  try {
    let text: string;
    if (extension === '.docx') {
      const { extractRawText } = await import('mammoth');
      text = (await extractRawText({ buffer: Buffer.from(data) })).value;
    } else if (extension === '.pdf') {
      const { definePDFJSModule, getDocumentProxy, extractText } = await import('unpdf');
      // Use the patched PDF.js release, not unpdf's older embedded parser.
      await definePDFJSModule(async () => require('pdfjs-dist/legacy/build/pdf.mjs'));
      const assets = dirname(require.resolve('pdfjs-dist/package.json'));
      const pdf = await getDocumentProxy(new Uint8Array(data), {
        useWorkerFetch: false, cMapUrl: join(assets, 'cmaps') + sep, cMapPacked: true,
        standardFontDataUrl: join(assets, 'standard_fonts') + sep,
      });
      try { text = (await extractText(pdf, { mergePages: true })).text; }
      finally { await pdf.loadingTask.destroy(); }
    } else {
      const encoding = data[0] === 0xff && data[1] === 0xfe ? 'utf-16le'
        : data[0] === 0xfe && data[1] === 0xff ? 'utf-16be' : 'utf-8';
      text = new TextDecoder(encoding, { fatal: true }).decode(data);
    }
    text = text.trim();
    if (!text || text.includes('\0')) return { error: '未找到可读取的正文。扫描 PDF 请先进行 OCR 文字识别；文本文件请使用 UTF-8 或 UTF-16 编码。' };
    if (text.length > MAX_TEXT_LENGTH) return { error: '正文超过 20 万字符，请拆分或精简文件。' };
    return { text };
  } catch {
    return { error: '无法读取正文，请检查文件是否损坏、加密或格式不符；文本文件请使用 UTF-8 或 UTF-16 编码。' };
  }
}

if (!isMainThread) void parseDocument().then(result => parentPort?.postMessage(result));
