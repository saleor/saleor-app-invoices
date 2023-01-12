import { createClient } from "../../lib/graphql";
import { verifyJWT } from "@saleor/app-sdk/verify-jwt"; //todo
import { middleware, procedure } from "./trpc-server";
import { saleorApp } from "../../../saleor-app";
import { TRPCError } from "@trpc/server";
import { ProtectedHandlerError } from "@saleor/app-sdk/handlers/next";

const attachAppToken = middleware(async ({ ctx, next }) => {
  if (!ctx.domain) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing domain in request",
    });
  }

  if (!ctx.token) {
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

  try {
    await verifyJWT({
      appId: authData.appId,
      token: ctx.token,
      saleorApiUrl: authData.saleorApiUrl,
    });
  } catch (e) {
    throw new ProtectedHandlerError("JWT verification failed: ", "JWT_VERIFICATION_FAILED");
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
