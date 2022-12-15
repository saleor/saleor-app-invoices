import { InvoiceGenerator } from "../invoice-generator";
import { Order, OrderFragment } from "../../../../generated/graphql";
import * as fs from "fs";
import { join } from "path";
const puppeteer = require("puppeteer");

export class PuppeteerInvoiceGenerator implements InvoiceGenerator {
  async generate(order: OrderFragment, filename = "invoice.pdf"): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const templatePath = join(
      process.cwd(),
      "src",
      "modules",
      "invoice-generator",
      "puppeteer",
      "template.html"
    );

    console.log("Using template: ", templatePath);

    const html = fs.readFileSync(templatePath, "utf8");

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    // todo saving on disk is redundant here, interface can allow returning buffer
    await page.pdf({
      format: "A4",
      path: filename,
    });

    await browser.close();
  }
}
