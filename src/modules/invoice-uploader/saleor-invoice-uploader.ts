import { InvoiceUploader } from "./invoice-uploader";
import { Client, gql } from "urql";
import { readFile } from "fs/promises";
import { Blob } from "buffer";
import { FileUploadMutation } from "../../../generated/graphql";

const fileUpload = gql`
  mutation FileUpload($file: Upload!) {
    fileUpload(file: $file) {
      errors {
        message
      }
      uploadedFile {
        url
      }
    }
  }
`;

export class SaleorInvoiceUploader implements InvoiceUploader {
  constructor(private client: Client) {}

  upload(filePath: string): Promise<string> {
    return readFile(filePath).then((file) => {
      /**
       * Should be File to infer file name in the API, however its not part of Node.js yet
       * https://github.com/nodejs/node/commit/916af4ef2d63fe936a369bcf87ee4f69ec7c67ce
       */
      const blob = new Blob([file], { type: "application/pdf" });

      return this.client
        .mutation<FileUploadMutation>(fileUpload, {
          file: blob,
        })
        .toPromise()
        .then((r) => {
          if (r.data?.fileUpload?.uploadedFile?.url) {
            return r.data.fileUpload.uploadedFile.url;
          } else {
            throw new Error(r.error?.message);
          }
        });
    });
  }
}
