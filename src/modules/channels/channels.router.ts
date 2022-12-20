import { createClient } from "../../lib/graphql";
import { router } from "../trpc/trpc-server";
import { procedureWithGraphqlClient } from "../trpc/procedure-with-graphql-client";
import { ChannelsFetcher } from "./channels-fetcher";
import { ChannelFragment } from "../../../generated/graphql";

export const channelsRouter = router({
  fetch: procedureWithGraphqlClient.query(async ({ ctx, input }): Promise<ChannelFragment[]> => {
    const client = createClient(`https://${ctx.domain}/graphql/`, async () =>
      Promise.resolve({ token: ctx.appToken })
    );

    const fetcher = new ChannelsFetcher(client);

    return fetcher.fetchChannels().then((channels) => channels ?? []);
  }),
});
