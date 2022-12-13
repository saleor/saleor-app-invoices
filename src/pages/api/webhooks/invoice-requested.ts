import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../../saleor-app";
import { InvoiceRequestedPayloadFragment } from "../../../../generated/graphql";

export const InvoiceCreatedPayloadFragment = gql`
  fragment InvoiceRequestedPayload on InvoiceRequested {
    invoice {
      id
    }
  }
`;

const InvoiceRequestedSubscription = gql`
  ${InvoiceCreatedPayloadFragment}

  subscription InvoiceRequested {
    event {
      ...InvoiceRequestedPayload
    }
  }
`;

export const invoiceRequestedWebhook = new SaleorAsyncWebhook<InvoiceRequestedPayloadFragment>({
  name: "Invoice requested",
  webhookPath: "api/webhooks/invoice-requested",
  asyncEvent: "INVOICE_REQUESTED",
  apl: saleorApp.apl,
  subscriptionQueryAst: InvoiceRequestedSubscription,
});

export const handler: NextWebhookApiHandler<InvoiceRequestedPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { event, authData, payload } = context;

  console.log(event);
  console.log(payload);

  res.status(200).end();
};

export default invoiceRequestedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
