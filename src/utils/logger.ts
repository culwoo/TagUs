declare global {
  interface ImportMetaEnv {
    readonly VITE_LOG_LEVEL?: string;
  }
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    // Check environment variable for log level
    const envLogLevel = import.meta.env.VITE_LOG_LEVEL;
    if (envLogLevel && envLogLevel in LogLevel) {
      this.logLevel = LogLevel[envLogLevel as keyof typeof LogLevel];
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown) {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      data,
    };

    // Store in memory
    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with colors
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const levelName = LogLevel[level];

    console.log(
      `${colors[level]}[${levelName}]${reset} ${context ? `[${context}] ` : ''}${message}`,
      data || ''
    );
  }

  debug(message: string, context?: string, data?: unknown) {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: unknown) {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown) {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: unknown) {
    this.log(LogLevel.ERROR, message, context, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience functions
export const log = {
  debug: (message: string, context?: string, data?: unknown) => logger.debug(message, context, data),
  info: (message: string, context?: string, data?: unknown) => logger.info(message, context, data),
  warn: (message: string, context?: string, data?: unknown) => logger.warn(message, context, data),
  error: (message: string, context?: string, data?: unknown) => logger.error(message, context, data),
  getLogs: () => logger.getLogs(),
  clearLogs: () => logger.clearLogs(),
};
