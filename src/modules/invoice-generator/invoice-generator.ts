import { OrderFragment } from "../../../generated/graphql";

export interface InvoiceGenerator {
  generate(order: OrderFragment, invoiceNumber: string, filename: string): Promise<void>;
}
