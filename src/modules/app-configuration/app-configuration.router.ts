import { FetchChannelsDocument } from "../../../generated/graphql";
import { createClient } from "../../lib/graphql";

import { gql } from "urql";
import { router } from "../trpc/trpc-server";
import { procedureWithGraphqlClient } from "../trpc/procedure-with-graphql-client";
import { PrivateMetadataAppConfigurator } from "./app-configurator";
import { createSettingsManager } from "./metadata-manager";
import { z } from "zod";

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

    // todo - fetch Shop data as default?
    const settings = (await appConfigurator.getConfig()) ?? null;

    console.log(settings);

    return settings;
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
