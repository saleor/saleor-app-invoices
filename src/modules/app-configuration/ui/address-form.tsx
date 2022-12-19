import { SellerShopConfig } from "../app-config";
import { useForm } from "react-hook-form";
import { TextField, Typography } from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";

const useStyles = makeStyles((theme) => {
  return {
    field: {
      marginBottom: 20,
    },
    form: {
      padding: 20,
    },
  };
});

export const AddressForm = (props: {
  channelSlug: string;
  channelName: string;
  onSubmit(data: SellerShopConfig["address"]): Promise<void>;
  initialData?: SellerShopConfig["address"] | null;
}) => {
  const { register, handleSubmit } = useForm<SellerShopConfig["address"]>({
    defaultValues: props.initialData ?? undefined,
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
