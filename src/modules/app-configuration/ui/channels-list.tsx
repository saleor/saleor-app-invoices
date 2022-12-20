import {
  makeStyles,
  OffsettedList,
  OffsettedListBody,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";
import { Typography } from "@material-ui/core";
import React from "react";
import { ChannelFragment } from "../../../../generated/graphql";

const useStyles = makeStyles((theme) => {
  return {
    listItem: {
      cursor: "pointer",
      height: "auto !important",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
    },
    listItemActive: {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    cellSlug: {
      textAlign: "right",
      fontFamily: "monospace",
    },
  };
});

type Props = {
  channels: ChannelFragment[];
  activeChannelSlug: string;
  onChannelClick(channelSlug: string): void;
};

export const ChannelsList = ({ channels, activeChannelSlug, onChannelClick }: Props) => {
  const styles = useStyles();

  return (
    <OffsettedList gridTemplate={["1fr", "1fr"]}>
      <OffsettedListBody>
        {channels.map((c) => {
          return (
            <OffsettedListItem
              className={clsx(styles.listItem, {
                [styles.listItemActive]: c.slug === activeChannelSlug,
              })}
              key={c.slug}
              onClick={() => {
                onChannelClick(c.slug);
              }}
            >
              <OffsettedListItemCell>{c.name}</OffsettedListItemCell>
              <OffsettedListItemCell className={styles.cellSlug}>
                <Typography variant="caption">{c.slug}</Typography>
              </OffsettedListItemCell>
            </OffsettedListItem>
          );
        })}
      </OffsettedListBody>
    </OffsettedList>
  );
};
