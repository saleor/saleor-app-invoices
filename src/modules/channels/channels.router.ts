import { FetchChannelsDocument } from "../../../generated/graphql";
import { createClient } from "../../lib/graphql";

import { gql } from "urql";
import { router } from "../trpc/trpc-server";
import { procedureWithGraphqlClient } from "../trpc/procedure-with-graphql-client";

gql`
  query FetchChannels {
    channels {
      name
      id
      slug
    }
  }
`;

export const channelsRouter = router({
  fetch: procedureWithGraphqlClient.query(async ({ ctx, input }) => {
    const client = createClient(`https://${ctx.domain}/graphql/`, async () =>
      Promise.resolve({ token: ctx.appToken })
    );

    const data = await client.query(FetchChannelsDocument, {}).toPromise();

    return data;
  }),
});
