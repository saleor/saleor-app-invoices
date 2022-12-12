import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";
import { useRouter } from "next/router";

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
