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
import { appConfigurationRouter } from "../../../modules/app-configuration/app-configuration.router";
import { createLogger } from "../../../lib/logger";

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
  const { authData, payload, baseUrl } = context;

  const logger = createLogger({ domain: authData.domain, url: baseUrl });

  const order = mockOrder; // todo get from payload when fixed

  logger.info({ orderId: order.id }, "Received event INVOICE_REQUESTED");
  logger.debug(order);

  const orderId = mockOrder.id;
  const invoiceName = invoiceNumberGenerator.generateFromOrder(
    order as OrderFragment,
    InvoiceNumberGenerationStrategy.localizedDate("en-US") // todo connect locale -> where from?
  );

  logger.debug({ invoiceName }, "Generated invoice name");

  if (!authData) {
    logger.error("Auth data not found");

    return res.status(403).json({
      error: `Could not find auth data. Check if app is installed.`,
    });
  }

  try {
    const client = createClient(`https://${authData.domain}/graphql/`, async () =>
      Promise.resolve({ token: authData.token })
    );

    const hashedInvoiceName = hashInvoiceFilename(invoiceName, orderId);
    logger.debug({ hashedInvoiceName });

    const hashedInvoiceFileName = `${hashedInvoiceName}.pdf`;
    const tempPdfLocation = resolveTempPdfFileLocation(hashedInvoiceFileName);
    logger.debug({ tempPdfLocation });

    const configurationCaller = appConfigurationRouter.createCaller(authData);
    const appConfig = await configurationCaller.fetch();

    await new MicroinvoiceInvoiceGenerator()
      .generate({
        order,
        invoiceNumber: invoiceName,
        filename: tempPdfLocation,
        companyAddressData: appConfig.shopConfigPerChannel[order.channel.slug]?.address,
      })
      .catch((err) => {
        logger.error(err, "Error generating invoice");

        return res.status(500).json({
          error: "Error generating invoice",
        });
      });

    const uploader = new SaleorInvoiceUploader(client);

    const uploadedFileUrl = await uploader.upload(tempPdfLocation, `${invoiceName}.pdf`);
    logger.info({ uploadedFileUrl }, "Uploaded file to storage, will notify Saleor now");

    await new InvoiceCreateNotifier(client).notifyInvoiceCreated(
      orderId,
      invoiceName,
      uploadedFileUrl
    );
  } catch (e) {
    logger.error(e);

    return res.status(500).json({
      error: (e as any)?.message ?? "Error",
    });
  }

  logger.info("Success");

  return res.status(200).end();
};

export default invoiceRequestedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
