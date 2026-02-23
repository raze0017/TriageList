"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const log = (level, message, meta) => {
    const timestamp = new Date().toISOString();
    if (meta !== undefined) {
        console.log(JSON.stringify({ level, timestamp, message, meta }));
        return;
    }
    console.log(JSON.stringify({ level, timestamp, message }));
};
exports.logger = {
    info: (message, meta) => log("INFO", message, meta),
    error: (message, meta) => log("ERROR", message, meta),
};
