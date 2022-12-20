const pino = require("pino");

/**
 * TODO Set up control via env, log drain etc
 */
export const pinoLogger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});
