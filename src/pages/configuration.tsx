import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import React from "react";

const ConfigurationPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();

  return (
    <div>
      <h1>Saleor Invoices Hub</h1>
      <h2>configuration</h2>
    </div>
  );
};

export default ConfigurationPage;
