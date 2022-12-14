import { Client, gql } from "urql";
import { InvoiceCreateMutation, InvoiceCreateMutationVariables } from "../../../generated/graphql";

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
    return this.client
      .mutation<InvoiceCreateMutation, InvoiceCreateMutationVariables>(InvoiceCreateMutation, {
        orderId,
        invoiceInput: {
          url: invoiceUrl,
          number: invoiceNumber,
        },
      })
      .toPromise()
      .then((result) => {
        if (result.error) {
          throw new Error(result.error.message);
        }
      });
  }
}
