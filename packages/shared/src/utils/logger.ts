import winston from 'winston';
import path from 'path';
import util from 'util';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Legacy-compatible log levels
 */
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

/**
 * Extract caller filename from stack
 */
function getCallerFile() {
  const stack = new Error().stack?.split('\n') || [];
  const callerLine = stack[3] || '';
  const match =
    callerLine.match(/\((.*):\d+:\d+\)/) ||
    callerLine.match(/at (.*):\d+:\d+/);

  return match ? path.basename(match[1]) : 'server';
}

/**
 * Normalize message (string | object | Error)
 */
function normalizeMessage(input: any) {
  if (input instanceof Error) {
    return {
      message: input.message,
      stack: input.stack,
    };
  }

  if (typeof input === 'object') {
    return input;
  }

  return { message: String(input) };
}

/**
 * Singleton Winston logger
 */
const baseLogger = winston.createLogger({
  levels,
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, label, message, stack, ...rest }) => {
      const payload = {
        message,
        stack,
        ...(Object.keys(rest).length ? rest : {}),
      };

      const serialized =
        typeof payload === 'string'
          ? payload
          : util.inspect(payload, { depth: null, colors: false });

      return `[${timestamp}] [${label}] ${level.toUpperCase()}: ${serialized}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: isProd ? 'info' : 'debug',
    }),
  ],
});

/**
 * Public logger (named export)
 */
export const logger: Record<string, Function> = {};

for (const level of Object.keys(levels)) {
  logger[level] = (input: any, meta?: any) => {
    const label = getCallerFile();
    const normalized = normalizeMessage(input);

    baseLogger.log({
      level,
      label,
      ...normalized,
      ...(meta && { meta }),
    });
  };
}
