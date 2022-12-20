import pino from "pino";

/**
 * TODO Set up log drain etc
 */
export const logger = pino({
  level: process.env.DEBUG ?? "silent",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const createLogger = logger.child.bind(logger);
