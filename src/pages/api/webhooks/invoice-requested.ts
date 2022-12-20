import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../../saleor-app";
import { InvoiceRequestedPayloadFragment, OrderFragment } from "../../../../generated/graphql";
import { createClient } from "../../../lib/graphql";
import { SaleorInvoiceUploader } from "../../../modules/invoice-uploader/saleor-invoice-uploader";
import { InvoiceCreateNotifier } from "../../../modules/invoice-create-notifier/invoice-create-notifier";
import {
  InvoiceNumberGenerationStrategy,
  InvoiceNumberGenerator,
} from "../../../modules/invoice-number-generator/invoice-number-generator";
import { mockOrder } from "../../../fixtures/mock-order";
import { MicroinvoiceInvoiceGenerator } from "../../../modules/invoice-generator/microinvoice/microinvoice-invoice-generator";
import { hashInvoiceFilename } from "../../../modules/invoice-file-name/hash-invoice-filename";
import { resolveTempPdfFileLocation } from "../../../modules/invoice-file-name/resolve-temp-pdf-file-location";
import { createSettingsManager } from "../../../modules/app-configuration/metadata-manager";
import { PrivateMetadataAppConfigurator } from "../../../modules/app-configuration/app-configurator";
import { appConfigurationRouter } from "../../../modules/app-configuration/app-configuration.router";

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

const invoiceNumberGenerator = new InvoiceNumberGenerator();

export const handler: NextWebhookApiHandler<InvoiceRequestedPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { event, authData, payload } = context;

  /**
   * todo change to log/debug lib
   */
  console.debug("Webhook start");
  console.time();

  const order = mockOrder; // todo get from payload when fixed

  const orderId = mockOrder.id;
  const invoiceName = invoiceNumberGenerator.generateFromOrder(
    order as OrderFragment,
    InvoiceNumberGenerationStrategy.localizedDate("us-US")
  );

  if (!authData) {
    return res.status(403).json({
      error: `Could not find auth data. Check if app is installed.`,
    });
  }

  try {
    const client = createClient(`https://${authData.domain}/graphql/`, async () =>
      Promise.resolve({ token: authData.token })
    );

    const hashedInvoiceName = hashInvoiceFilename(invoiceName, orderId);
    const hashedInvoiceFileName = `${hashedInvoiceName}.pdf`;
    const tempPdfLocation = resolveTempPdfFileLocation(hashedInvoiceFileName);

    const settingsManager = createSettingsManager(client);
    const appConfigManager = new PrivateMetadataAppConfigurator(settingsManager, authData.domain);
    const config = await appConfigManager.getConfig();

    try {
      const caller = appConfigurationRouter.createCaller(authData);
      const r = await caller.fetch();

      console.log("caller response");
      console.log(r);
    } catch (e) {
      console.error("error using caller");
      console.error(e);
    }

    if (!config) {
      // todo must fallback here to Shop

      return res.status(500);
    }

    await new MicroinvoiceInvoiceGenerator()
      .generate({
        order,
        invoiceNumber: invoiceName,
        filename: tempPdfLocation,
        companyAddressData: config.shopConfigPerChannel[order.channel.slug]?.address,
      })
      .catch((err) => {
        console.error("Error generating invoice");
        console.error(err);

        return res.status(500).json({
          error: "Error generating invoice",
        });
      });

    const uploader = new SaleorInvoiceUploader(client);

    const uploadedFileUrl = await uploader.upload(tempPdfLocation, `${invoiceName}.pdf`);

    console.debug("Uploaded file url: ", uploadedFileUrl);
    console.debug("Generated invoice name:", invoiceName);

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

  console.debug("Success");
  console.timeEnd();

  res.status(200).end();
};

export default invoiceRequestedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
