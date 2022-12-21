import { router } from "../trpc/trpc-server";
import { procedureWithGraphqlClient } from "../trpc/procedure-with-graphql-client";
import { PrivateMetadataAppConfigurator } from "./app-configurator";
import { createSettingsManager } from "./metadata-manager";
import { ChannelsFetcher } from "../channels/channels-fetcher";
import { ShopInfoFetcher } from "../shop-info/shop-info-fetcher";
import { logger as pinoLogger } from "../../lib/logger";
import { FallbackAppConfig } from "./fallback-app-config";
import { appConfigInputSchema } from "./app-config-input-schema";
import { TRPCError } from "@trpc/server";

export const appConfigurationRouter = router({
  fetch: procedureWithGraphqlClient.query(async ({ ctx, input }) => {
    if (!ctx.domain) {
      throw new TRPCError({ message: "Auth data not found", code: "BAD_REQUEST" });
    }

    const logger = pinoLogger.child({ domain: ctx.domain });

    logger.debug("appConfigurationRouter.fetch called");

    const appConfigurator = new PrivateMetadataAppConfigurator(
      createSettingsManager(ctx.apiClient),
      ctx.domain
    );

    const savedAppConfig = (await appConfigurator.getConfig()) ?? null;

    logger.debug(savedAppConfig, "Retrieved app config from Metadata. Will return it");

    if (savedAppConfig) {
      return savedAppConfig;
    }

    logger.info("App config not found in metadata. Will create default config now.");

    const channelsFetcher = new ChannelsFetcher(ctx.apiClient);
    const shopInfoFetcher = new ShopInfoFetcher(ctx.apiClient);

    const [channels, shopAddress] = await Promise.all([
      channelsFetcher.fetchChannels(),
      shopInfoFetcher.fetchShopInfo(),
    ]);

    logger.debug(channels, "Fetched channels");
    logger.debug(shopAddress, "Fetched shop address");

    const appConfig = FallbackAppConfig.createFallbackConfigFromExistingShopAndChannels(
      channels ?? [],
      shopAddress
    );

    logger.debug(appConfig, "Created a fallback AppConfig. Will save it.");

    await appConfigurator.setConfig(appConfig);

    logger.info("Saved initial AppConfig");

    return appConfig;
  }),
  setAndReplace: procedureWithGraphqlClient
    .input(appConfigInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.domain) {
        throw new TRPCError({ message: "Auth data not found", code: "BAD_REQUEST" });
      }

      const logger = pinoLogger.child({ domain: ctx.domain });

      logger.info(input, "appConfigurationRouter.setAndReplace called with input");

      const appConfigurator = new PrivateMetadataAppConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.domain
      );

      await appConfigurator.setConfig(input);

      return null;
    }),
});
