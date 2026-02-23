type Meta = Record<string, unknown> | Error | unknown;
type LogLevel = "INFO" | "WARN" | "ERROR";
const log = (level: LogLevel, message: string, meta?: Meta) => {
  const timestamp = new Date().toISOString();
  if (meta !== undefined) {
    console.log(JSON.stringify({ level, timestamp, message, meta }));
    return;
  }
  console.log(JSON.stringify({ level, timestamp, message }));
};

export const logger = {
  info: (message: string, meta?: Meta) => log("INFO", message, meta),
  warn: (message: string, meta?: Meta) => log("WARN", message, meta),

  error: (message: string, meta?: Meta) => log("ERROR", message, meta),
};
