import { OrderFragment } from "../../generated/graphql";

export const mockOrder: OrderFragment = {
  id: "T3JkZXI6OTFiZjM5ZDQtZjRiMC00M2QyLTgwMjEtZjVkMTMwNDVlMjkx",
  billingAddress: {
    id: "QWRkcmVzczoxNzE4Ng==",
    country: {
      country: "Poland",
      code: "PL",
    },
    companyName: "Fajna firma lol",
    cityArea: "",
    countryArea: "",
    streetAddress1: "street 1",
    streetAddress2: "Street 2",
    postalCode: "55-123",
    phone: "+48690563008",
    firstName: "MAdzia",
    lastName: "Markusik",
    city: "WRO",
  },
  shippingAddress: {
    id: "QWRkcmVzczoxNzE4NQ==",
    country: {
      country: "Poland",
      code: "PL",
    },
    companyName: "Fajna firma lol",
    cityArea: "",
    countryArea: "",
    streetAddress1: "street 1",
    streetAddress2: "Street 2",
    postalCode: "55-123",
    phone: "+48690563008",
    firstName: "john",
    lastName: "doe",
    city: "WRO",
  },
  created: "2022-12-02T15:05:56.637068+00:00",
  fulfillments: [],
  number: "3991",
  total: {
    currency: "USD",
    gross: {
      amount: 207.15,
      currency: "USD",
    },
    net: {
      amount: 206,
      currency: "USD",
    },
    tax: {
      amount: 1.15,
      currency: "USD",
    },
  },
};
