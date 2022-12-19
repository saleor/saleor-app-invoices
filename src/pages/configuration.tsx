import { NextPage } from "next";
import React from "react";
import { PageTab, PageTabs } from "@saleor/macaw-ui";
import { ChannelsConfiguration } from "../modules/app-configuration/ui/channels-configuration";
import { Divider } from "@material-ui/core";

type Tab = "channels";

const ConfigurationPage: NextPage = () => {
  const [activeTab, setActiveTab] = React.useState<Tab>("channels");

  return (
    <div>
      <h1>Saleor Invoices App</h1>
      <p>Generate invoices for Orders in your shop</p>

      <PageTabs
        style={{ marginBottom: 20 }}
        value={activeTab}
        onChange={(e) => setActiveTab(e as Tab)}
      >
        <PageTab value="channels" label="Channels configuration" />
      </PageTabs>
      <Divider style={{ marginBottom: 20 }} />

      {activeTab === "channels" && <ChannelsConfiguration />}
    </div>
  );
};

export default ConfigurationPage;
