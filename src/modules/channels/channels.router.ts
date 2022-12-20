import { FetchChannelsDocument } from "../../../generated/graphql";
import { createClient } from "../../lib/graphql";

import { gql } from "urql";
import { router } from "../trpc/trpc-server";
import { procedureWithGraphqlClient } from "../trpc/procedure-with-graphql-client";
import { ChannelsFetcher } from "./channels-fetcher";

export const channelsRouter = router({
  fetch: procedureWithGraphqlClient.query(async ({ ctx, input }) => {
    const client = createClient(`https://${ctx.domain}/graphql/`, async () =>
      Promise.resolve({ token: ctx.appToken })
    );

    const fetcher = new ChannelsFetcher(client);

    return fetcher.fetchChannels();
  }),
});
