import pino from "pino";

/**
 * TODO Set up control via env, log drain etc
 */
export const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const createLogger = logger.child.bind(logger);
