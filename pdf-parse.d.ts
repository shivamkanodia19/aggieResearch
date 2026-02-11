declare module "pdf-parse" {
  interface PDFTextResult {
    text: string;
  }

  class PDFParse {
    constructor(options: { data: Buffer | ArrayBuffer });
    getText(): Promise<PDFTextResult>;
    getRawTextContent(): Promise<string>;
    destroy(): Promise<void>;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
    text: string;
  }

  function pdfParse(dataBuffer: Buffer | ArrayBuffer): Promise<PDFData>;
  export default pdfParse;
  export { PDFParse };
}
