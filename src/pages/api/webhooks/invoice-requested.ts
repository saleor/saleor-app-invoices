import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../../saleor-app";
import { InvoiceRequestedPayloadFragment } from "../../../../generated/graphql";
import { createClient } from "../../../lib/graphql";
import { SaleorInvoiceUploader } from "../../../modules/invoice-uploader/saleor-invoice-uploader";
import { InvoiceCreateNotifier } from "../../../modules/invoice-create-notifier/invoice-create-notifier";

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

  const orderId = "asd"; // todo get from payload
  const invoiceName = "test"; // todo add strategy to get from order

  if (!authData) {
    return res.status(403).json({
      error: `Could not find auth data. Check if app is installed.`,
    });
  }

  // todo generate invoice
  try {
    const client = createClient(`https://${authData.domain}/graphql/`, async () =>
      Promise.resolve({ token: authData.token })
    );

    const uploader = new SaleorInvoiceUploader(client);

    const uploadedFileUrl = await uploader.upload("sample.pdf"); // todo use real generated file

    await new InvoiceCreateNotifier(client).notifyInvoiceCreated(
      orderId,
      invoiceName,
      uploadedFileUrl
    );
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: (e as any)?.message ?? "Error",
    });
  }

  res.status(200).end();
};

export default invoiceRequestedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
