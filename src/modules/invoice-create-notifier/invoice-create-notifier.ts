import { Client, gql } from "urql";
import { InvoiceCreate, InvoiceCreateInput } from "../../../generated/graphql";

const InvoiceCreateMutation = gql`
  mutation InvoiceCreate($orderId: ID!, $invoiceInput: InvoiceCreateInput!) {
    invoiceCreate(input: $invoiceInput, orderId: $orderId) {
      errors {
        message
      }
      invoice {
        id
      }
    }
  }
`;

export class InvoiceCreateNotifier {
  constructor(private client: Client) {}

  notifyInvoiceCreated(orderId: string, invoiceNumber: string, invoiceUrl: string) {
    return (
      this.client
        // TODO Why these generated types are missing
        .mutation<InvoiceCreate, { orderId: string; invoiceInput: InvoiceCreateInput }>(
          InvoiceCreateMutation,
          {
            orderId,
            invoiceInput: {
              url: invoiceUrl,
              number: invoiceNumber,
            },
          }
        )
        .toPromise()
        .then((result) => {
          console.log("invoiceCreate result");
          console.log(result.data);

          if (result.error) {
            throw new Error(result.error.message);
          }
        })
    );
  }
}
