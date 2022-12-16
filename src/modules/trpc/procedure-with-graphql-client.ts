import { createClient } from "../../lib/graphql";

import { middleware, procedure } from "./trpc-server";
import { saleorApp } from "../../../saleor-app";
import { TRPCError } from "@trpc/server";

const attachAppToken = middleware(async ({ ctx, next }) => {
  if (!ctx.domain) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing domain in request",
    });
  }

  const authData = await saleorApp.apl.get(ctx.domain);

  if (!authData?.token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing auth data",
    });
  }

  return next({
    ctx: {
      appToken: authData.token,
    },
  });
});

/**
 * Construct common graphQL client and attach it to the context
 */
export const procedureWithGraphqlClient = procedure
  .use(attachAppToken)
  .use(async ({ ctx, next }) => {
    const client = createClient(`https://${ctx.domain}/graphql/`, async () =>
      Promise.resolve({ token: ctx.appToken })
    );

    return next({
      ctx: {
        apiClient: client,
        domain: ctx.domain,
        appToken: ctx.appToken,
      },
    });
  });
