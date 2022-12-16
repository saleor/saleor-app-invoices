import { trpcClient } from "../../trpc/trpc-client";
import { LinearProgress, Typography } from "@material-ui/core";
import React from "react";
import { Accordion, AccordionSummary, Button, NavigationCardBase } from "@saleor/macaw-ui";

/**
 * todo
 * - add form (rhf?) -> dynamic, per channel
 * - save to metadata
 * - fetch initial state from metadata
 * - fallback to Shop
 */
export const ChannelsConfiguration = () => {
  const {} = trpcClient.appConfiguration.fetch.useQuery();
  const { data: channelsData, isLoading } = trpcClient.channels.fetch.useQuery();

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 40 }}>
      <Typography>Configure seller details visible on the invoice</Typography>

      <NavigationCardBase>
        <form>
          {channelsData?.data?.channels?.map((c) => {
            return (
              <Accordion key={c.slug}>
                <AccordionSummary>
                  <Typography>{c.name}</Typography>
                </AccordionSummary>
                <div>form fields</div>
              </Accordion>
            );
          })}
          <div style={{ padding: 20 }}>
            <Button variant="primary">Save</Button>
          </div>
        </form>
      </NavigationCardBase>
    </div>
  );
};
