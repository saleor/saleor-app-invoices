import { OrderFragment } from "../../../generated/graphql";
import { SellerShopConfig } from "../app-configuration/app-config";

export interface InvoiceGenerator {
  generate(input: {
    order: OrderFragment;
    invoiceNumber: string;
    filename: string;
    companyAddressData: SellerShopConfig["address"];
  }): Promise<void>;
}
