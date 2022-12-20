import { FetchChannelsDocument } from "../../../generated/graphql";
import { createClient } from "../../lib/graphql";

import { gql } from "urql";
import { router } from "../trpc/trpc-server";
import { procedureWithGraphqlClient } from "../trpc/procedure-with-graphql-client";
import { PrivateMetadataAppConfigurator } from "./app-configurator";
import { createSettingsManager } from "./metadata-manager";
import { z } from "zod";
import { ChannelsFetcher } from "../channels/channels-fetcher";
import { AppConfigContainer } from "./app-config-container";
import { AppConfig } from "./app-config";
import { ShopInfoFetcher } from "../shop-info/shop-info-fetcher";

gql`
  query FetchChannels {
    channels {
      name
      id
      slug
    }
  }
`;

export const appConfigurationRouter = router({
  fetch: procedureWithGraphqlClient.query(async ({ ctx, input }) => {
    const client = createClient(`https://${ctx.domain}/graphql/`, async () =>
      Promise.resolve({ token: ctx.appToken })
    );

    const appConfigurator = new PrivateMetadataAppConfigurator(
      createSettingsManager(client),
      ctx.domain
    );

    const savedAppConfig = (await appConfigurator.getConfig()) ?? null;

    if (!savedAppConfig) {
      const channelsFetcher = new ChannelsFetcher(client);
      const shopInfoFetcher = new ShopInfoFetcher(client);

      const channels = (await channelsFetcher.fetchChannels()) ?? [];
      const shopAddress = await shopInfoFetcher.fetchShopInfo();

      const appConfig = channels.reduce<AppConfig>(
        (state, channel) => {
          return AppConfigContainer.setChannelAddress(state)(channel.slug)({
            city: shopAddress?.companyAddress?.city ?? "",
            cityArea: shopAddress?.companyAddress?.cityArea ?? "",
            companyName: shopAddress?.companyAddress?.companyName ?? "",
            country: shopAddress?.companyAddress?.country.country ?? "",
            countryArea: shopAddress?.companyAddress?.countryArea ?? "",
            firstName: shopAddress?.companyAddress?.firstName ?? "",
            lastName: shopAddress?.companyAddress?.lastName ?? "",
            postalCode: shopAddress?.companyAddress?.postalCode ?? "",
            streetAddress1: shopAddress?.companyAddress?.streetAddress1 ?? "",
            streetAddress2: shopAddress?.companyAddress?.streetAddress2 ?? "",
          });
        },
        { shopConfigPerChannel: {} }
      );

      await appConfigurator.setConfig(appConfig);

      return appConfig;
    }

    return savedAppConfig;
  }),
  setAndReplace: procedureWithGraphqlClient
    .input(
      z.object({
        shopConfigPerChannel: z.record(
          z.object({
            address: z.object({
              companyName: z.string().min(0),
              cityArea: z.string().min(0),
              countryArea: z.string().min(0),
              streetAddress1: z.string().min(0),
              streetAddress2: z.string().min(0),
              postalCode: z.string().min(0),
              firstName: z.string().min(0),
              lastName: z.string().min(0),
              city: z.string().min(0),
              country: z.string().min(0),
            }),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = createClient(`https://${ctx.domain}/graphql/`, async () =>
        Promise.resolve({ token: ctx.appToken })
      );

      const appConfigurator = new PrivateMetadataAppConfigurator(
        createSettingsManager(client),
        ctx.domain
      );

      await appConfigurator.setConfig(input);

      return null;
    }),
});
