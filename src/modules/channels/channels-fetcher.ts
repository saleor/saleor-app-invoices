import { Client, gql } from "urql";
import { FetchChannelsDocument } from "../../../generated/graphql";

gql`
  query FetchChannels {
    channels {
      name
      id
      slug
    }
  }
`;

export class ChannelsFetcher {
  constructor(private client: Client) {}

  fetchChannels() {
    return this.client
      .query(FetchChannelsDocument, {})
      .toPromise()
      .then((r) => r.data?.channels ?? null);
  }
}
