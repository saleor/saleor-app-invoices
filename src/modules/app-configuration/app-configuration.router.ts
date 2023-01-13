import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { PrivateMetadataAppConfigurator } from "./app-configurator";
import { createSettingsManager } from "./metadata-manager";
import { ChannelsFetcher } from "../channels/channels-fetcher";
import { ShopInfoFetcher } from "../shop-info/shop-info-fetcher";
import { logger as pinoLogger } from "../../lib/logger";
import { FallbackAppConfig } from "./fallback-app-config";
import { appConfigInputSchema } from "./app-config-input-schema";

export const appConfigurationRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouter.fetch called");

    const appConfigurator = new PrivateMetadataAppConfigurator(
      createSettingsManager(ctx.apiClient),
      ctx.saleorApiUrl
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
  setAndReplace: protectedClientProcedure
    .input(appConfigInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.info(input, "appConfigurationRouter.setAndReplace called with input");

      const appConfigurator = new PrivateMetadataAppConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      await appConfigurator.setConfig(input);

      return null;
    }),
});
