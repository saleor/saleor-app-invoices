import { FetchChannelsDocument } from "../../../generated/graphql";
import { createClient } from "../../lib/graphql";

import { gql } from "urql";
import { router } from "../trpc/trpc-server";
import { procedureWithGraphqlClient } from "../trpc/procedure-with-graphql-client";
import { PrivateMetadataAppConfigurator } from "./app-configurator";
import { createSettingsManager } from "./metadata-manager";

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
    const settings = await appConfigurator.getConfig();

    return settings;
  }),
});
