import { NextMiddleware, NextResponse } from "next/server";
import { logger } from "./lib/logger";

export const middleware: NextMiddleware = (req) => {
  logger.debug({ url: req.url }, "Request");

  const response = NextResponse.next();

  logger.debug(response);

  return response;
};
