import { InvoiceGenerator } from "../invoice-generator";
import { Order, OrderFragment } from "../../../../generated/graphql";
const Microinvoice = require("microinvoice");

export class MicroinvoiceInvoiceGenerator implements InvoiceGenerator {
  async generate(order: OrderFragment, filename = "invoice.pdf"): Promise<void> {
    const microinvoiceInstance = new Microinvoice({
      style: {
        // header: {
        //   image: {
        //     path: "./examples/logo.png",
        //     width: 50,
        //     height: 19,
        //   },
        // },
      },
      data: {
        invoice: {
          name: "Invoice",

          header: [
            {
              label: "Invoice Number",
              value: order.number,
            },
            {
              label: "Status",
              value: "todo", // todo ?
            },
            {
              label: "Date",
              value: Intl.DateTimeFormat("pl-PL", {
                dateStyle: "medium",
                timeStyle: "medium",
              }).format(new Date(order.created)),
            },
          ],

          currency: "todo",

          customer: [
            {
              label: "Bill To",
              value: [
                `${order.billingAddress?.firstName} ${order.billingAddress?.lastName}`,
                order.billingAddress?.companyName,
                order.billingAddress?.phone,
                `${order.billingAddress?.streetAddress1}`,
                `${order.billingAddress?.streetAddress2}`,
                `${order.billingAddress?.postalCode} ${order.billingAddress?.city}`,
                order.billingAddress?.country.country,
              ],
            },
            {
              label: "Tax Identifier",
              value: "todo",
            },
            {
              label: "Information",
              value: "todo",
            },
          ],

          seller: [
            {
              label: "Bill From",
              value: ["todo"],
            },
            {
              label: "Tax Identifier",
              value: "todo",
            },
          ],

          legal: [
            // {
            //   value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
            //   weight: "bold",
            //   color: "primary",
            // },
            // {
            //   value: "sed do eiusmod tempor incididunt ut labore et dolore magna.",
            //   weight: "bold",
            //   color: "secondary",
            // },
          ],

          details: {
            header: [
              {
                value: "Description",
              },
              {
                value: "Quantity",
              },
              {
                value: "Subtotal",
              },
            ],

            parts: [
              ...order.lines.map((line) => {
                return [
                  {
                    value: line.productName,
                  },
                  {
                    value: line.quantity,
                  },
                  {
                    value: line.totalPrice.gross.amount,
                    price: true,
                  },
                ];
              }),
            ],

            total: [
              {
                label: "Total without VAT",
                value: order.total.net.amount,
                price: true,
              },
              {
                label: "VAT Value",
                value: order.total.tax.amount,
                price: true,
              },
              {
                label: "Total paid with VAT",
                value: order.total.gross.amount,
                price: true,
              },
            ],
          },
        },
      },
    });

    return microinvoiceInstance.generate(filename);
  }
}
