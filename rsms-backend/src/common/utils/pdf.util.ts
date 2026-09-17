export interface PdfDocument {
  on(event: 'data', listener: (chunk: Buffer) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  fontSize(size: number): this;
  text(text: string, options?: Record<string, unknown>): this;
  moveDown(lines?: number): this;
  end(): void;
}

type PdfDocumentCtor = new (options?: Record<string, unknown>) => PdfDocument;

// The published @types/pdfkit declarations type the module as an instance
// rather than a constructor, so the require is cast through this typed shim.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const PDFDocument = require('pdfkit') as PdfDocumentCtor;
