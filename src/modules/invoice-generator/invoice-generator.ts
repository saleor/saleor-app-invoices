import { OrderFragment } from "../../../generated/graphql";

export interface InvoiceGenerator {
  generate(order: OrderFragment, filename: string): Promise<void>;
}
