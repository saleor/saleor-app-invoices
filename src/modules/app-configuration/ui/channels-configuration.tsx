import { trpcClient } from "../../trpc/trpc-client";
import { Grid, LinearProgress, Paper, TextField, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import {
  Button,
  makeStyles,
  OffsettedList,
  OffsettedListBody,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";

import { useForm } from "react-hook-form";
import { AppConfig, SellerShopConfig } from "../app-config";

const useStyles = makeStyles((theme) => {
  return {
    header: { marginBottom: 20 },
    grid: { display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "start", gap: 40 },

    listItem: {
      cursor: "pointer",
      height: "auto",
    },
    listItemActive: {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    field: {
      marginBottom: 20,
    },
    form: {
      padding: 20,
    },
    formContainer: {
      top: 0,
      position: "sticky",
    },
  };
});

const Form = (props: {
  channelSlug: string;
  channelName: string;
  onSubmit(data: SellerShopConfig["address"]): Promise<void>;
  initialData?: SellerShopConfig["address"];
}) => {
  const { register, handleSubmit } = useForm<SellerShopConfig["address"]>({
    defaultValues: props.initialData,
  });
  const styles = useStyles();

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
      className={styles.form}
    >
      <Typography variant="body1" paragraph>
        Configure {props.channelName} channel:
      </Typography>
      <TextField
        className={styles.field}
        label="Company Name"
        fullWidth
        {...register("companyName")}
      />
      <TextField className={styles.field} label="First Name" fullWidth {...register("firstName")} />
      <TextField className={styles.field} label="Last Name" fullWidth {...register("lastName")} />
      <TextField
        className={styles.field}
        label="Street Address 1"
        fullWidth
        {...register("streetAddress1")}
      />
      <TextField
        className={styles.field}
        label="Street Address 2"
        fullWidth
        {...register("streetAddress2")}
      />
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 2fr" }}>
        <TextField
          className={styles.field}
          label="Postal Code"
          fullWidth
          {...register("postalCode")}
        />
        <TextField className={styles.field} label="City" fullWidth {...register("city")} />
      </div>
      <TextField className={styles.field} label="City Area" fullWidth {...register("cityArea")} />
      <TextField className={styles.field} label="Country" fullWidth {...register("country")} />
      <TextField
        className={styles.field}
        label="Country Area"
        fullWidth
        {...register("countryArea")}
      />
      <Button type="submit" fullWidth variant="primary">
        Save channel configuration
      </Button>
    </form>
  );
};

/**
 * todo
 * - add form (rhf?) -> dynamic, per channel
 * - save to metadata
 * - fetch initial state from metadata
 * - fallback to Shop
 */
export const ChannelsConfiguration = () => {
  const styles = useStyles();

  const { data: configurationData } = trpcClient.appConfiguration.fetch.useQuery();
  const {
    data: channelsData,
    isLoading,
    isSuccess: isChannelsFetchSuccess,
  } = trpcClient.channels.fetch.useQuery();
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const { mutate, error: saveError } = trpcClient.appConfiguration.setAndReplace.useMutation();

  useEffect(() => {
    if (isChannelsFetchSuccess) {
      setActiveChannel(channelsData!.data!.channels![0].slug ?? null);
    }
  }, [isChannelsFetchSuccess]);

  if (isLoading || !channelsData?.data?.channels) {
    return <LinearProgress />;
  }

  console.log(configurationData);

  return (
    <div>
      <Typography className={styles.header} variant="subtitle1">
        Configure seller details visible on the invoice
      </Typography>
      <div className={styles.grid}>
        <div>
          <OffsettedList gridTemplate={["1fr"]}></OffsettedList>
          <OffsettedListBody>
            {channelsData.data.channels.map((c) => {
              return (
                <OffsettedListItem
                  className={clsx(styles.listItem, {
                    [styles.listItemActive]: c.slug === activeChannel,
                  })}
                  key={c.slug}
                  onClick={() => {
                    setActiveChannel(c.slug);
                  }}
                >
                  <OffsettedListItemCell>{c.slug}</OffsettedListItemCell>
                </OffsettedListItem>
              );
            })}
          </OffsettedListBody>
        </div>

        {activeChannel && (
          <Paper elevation={0} className={styles.formContainer}>
            <Form
              key={activeChannel}
              channelSlug={activeChannel}
              onSubmit={async (data) => {
                const newConfig: AppConfig = configurationData
                  ? {
                      ...configurationData,
                    }
                  : {
                      shopConfigPerChannel: {},
                    };

                const relatedConfigPerChannel = newConfig.shopConfigPerChannel[activeChannel];

                if (relatedConfigPerChannel) {
                  relatedConfigPerChannel.address = data;
                } else {
                  newConfig.shopConfigPerChannel[activeChannel] = {
                    address: data,
                  };
                }

                console.log(newConfig);

                mutate(newConfig);
              }}
              initialData={configurationData?.shopConfigPerChannel[activeChannel]?.address}
              channelName={channelsData.data.channels.find((c) => c.slug === activeChannel)!.name}
            />
            {saveError && <span>{saveError.message}</span>}
          </Paper>
        )}
      </div>
    </div>
  );
};
