import pino from 'pino'

// Create Pino logger with structured logging
const pinoLogger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname'
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
})

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (meta) {
      pinoLogger.info(meta, msg)
    } else {
      pinoLogger.info(msg)
    }
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    if (meta) {
      pinoLogger.error(meta, msg)
    } else {
      pinoLogger.error(msg)
    }
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    if (meta) {
      pinoLogger.warn(meta, msg)
    } else {
      pinoLogger.warn(msg)
    }
  },
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (meta) {
      pinoLogger.debug(meta, msg)
    } else {
      pinoLogger.debug(msg)
    }
  }
}


