export interface InvoiceUploader {
  upload(filePath: string): Promise<string>;
}
