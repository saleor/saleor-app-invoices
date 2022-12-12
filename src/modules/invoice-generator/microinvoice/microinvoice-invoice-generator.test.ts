import { describe, it, beforeEach, afterEach } from "vitest";
import { MicroinvoiceInvoiceGenerator } from "./microinvoice-invoice-generator";
import {
  LanguageCodeEnum,
  Order,
  OrderAuthorizeStatusEnum,
  OrderChargeStatusEnum,
  OrderOriginEnum,
  OrderStatus,
  PaymentChargeStatusEnum,
  WeightUnitsEnum,
} from "../../../../generated/graphql";
import { readFile } from "fs/promises";
import rimraf from "rimraf";
import path from "path";

const mockOrder: Order = {
  availableCollectionPoints: [],
  __typename: "Order",
  availableShippingMethods: undefined,
  canFinalize: false,
  channel: {
    id: "channel1",
    currencyCode: "USD",
    name: "default",
    hasOrders: false,
    slug: "default",
    isActive: true,
    defaultCountry: {
      code: "PL",
      country: "Poland",
      vat: {
        countryCode: "PL",
        reducedRates: [],
        standardRate: 1,
      },
    },
  },
  chargeStatus: OrderChargeStatusEnum.Full,
  collectionPointName: undefined,
  created: "2022-11-22T11:54:59.373555+00:00",
  customerNote: "",
  deliveryMethod: undefined,
  discount: undefined,
  discountName: undefined,
  discounts: [],
  displayGrossPrices: false,
  events: [],
  fulfillments: [],
  giftCards: [],
  invoices: [],
  isPaid: false,
  isShippingRequired: false,
  languageCode: "",
  languageCodeEnum: LanguageCodeEnum.Af,
  lines: [
    {
      id: "line1",
      __typename: "OrderLine",
      allocations: undefined,
      digitalContentUrl: undefined,
      isShippingRequired: false,
      productName: "Shoes",
      productSku: undefined,
      productVariantId: undefined,
      quantity: 0,
      quantityFulfilled: 0,
      quantityToFulfill: 0,
      taxRate: 0,
      thumbnail: undefined,
      totalPrice: {
        tax: {
          amount: 12,
          currency: "USD",
        },
        gross: {
          amount: 100,
          currency: "USD",
        },
        currency: "USD",
        net: {
          amount: 80,
          currency: "USD",
        },
      },
      translatedProductName: "",
      translatedVariantName: "",
      undiscountedUnitPrice: {
        tax: {
          amount: 12,
          currency: "USD",
        },
        gross: {
          amount: 100,
          currency: "USD",
        },
        currency: "USD",
        net: {
          amount: 80,
          currency: "USD",
        },
      },
      unitDiscount: {
        amount: 0,
        currency: "USD",
      },
      unitDiscountReason: undefined,
      unitDiscountType: undefined,
      unitDiscountValue: undefined,
      unitPrice: {
        tax: {
          amount: 12,
          currency: "USD",
        },
        gross: {
          amount: 100,
          currency: "USD",
        },
        currency: "USD",
        net: {
          amount: 80,
          currency: "USD",
        },
      },
      variant: undefined,
      variantName: "",
    },
  ],
  metafield: undefined,
  metafields: undefined,
  number: "",
  origin: OrderOriginEnum.Checkout,
  original: undefined,
  paymentStatus: PaymentChargeStatusEnum.FullyCharged,
  paymentStatusDisplay: "",
  payments: [],
  privateMetafield: undefined,
  privateMetafields: undefined,
  redirectUrl: undefined,
  shippingAddress: undefined,
  shippingMethod: undefined,
  shippingMethodName: undefined,
  shippingMethods: [],
  shippingPrice: {
    tax: { amount: 1, currency: "USD" },
    currency: "USD",
    net: { amount: 1, currency: "USD" },
    gross: { amount: 1, currency: "USD" },
  },
  shippingTaxRate: 0,
  status: OrderStatus.Fulfilled,
  statusDisplay: "",
  token: "",
  totalAuthorized: {
    amount: 1,
    currency: "USD",
  },
  totalBalance: {
    amount: 1,
    currency: "USD",
  },
  totalCaptured: {
    amount: 1,
    currency: "USD",
  },
  trackingClientId: "",
  transactions: [],
  translatedDiscountName: undefined,
  undiscountedTotal: {
    net: { amount: 1, currency: "USD" },
    currency: "USD",
    gross: {
      amount: 1,
      currency: "USD",
    },
    tax: {
      amount: 1,
      currency: "USD",
    },
  },
  updatedAt: undefined,
  user: undefined,
  userEmail: undefined,
  voucher: undefined,
  weight: { unit: WeightUnitsEnum.Kg, value: 1 },

  actions: [],
  total: {
    gross: {
      amount: 50,
      currency: "USD",
    },
    tax: {
      amount: 10,
      currency: "USD",
    },
    net: {
      amount: 40,
      currency: "USD",
    },
    currency: "USD",
  },
  id: "xyz",
  errors: [],
  metadata: [],
  privateMetadata: [],
  authorizeStatus: OrderAuthorizeStatusEnum.Full,
  billingAddress: {
    city: "Krakow",
    __typename: "Address",
    cityArea: "Krakow",
    companyName: "Saleor",
    country: {
      country: "Poland",
      code: "PL",
    },
    countryArea: "Malopolskie",
    firstName: "John",
    id: "123",
    lastName: "Doe",
    phone: "123 123 123",
    postalCode: "30-123",
    streetAddress1: "Teczowa 123",
    streetAddress2: "",
  },
  subtotal: {
    tax: {
      amount: 12,
      currency: "USD",
    },
    gross: {
      amount: 100,
      currency: "USD",
    },
    currency: "USD",
    net: {
      amount: 80,
      currency: "USD",
    },
  },
};

const cleanup = () => rimraf.sync("test-invoice.pdf");

describe("MicroinvoiceInvoiceGenerator", () => {
  beforeEach(() => {
    cleanup();
  });

  // afterEach(() => {
  //   cleanup();
  // });

  it("Generates invoice file from Order", async () => {
    const instance = new MicroinvoiceInvoiceGenerator();

    await instance.generate(mockOrder, "test-invoice.pdf");

    return readFile("test-invoice.pdf");
  });
});
