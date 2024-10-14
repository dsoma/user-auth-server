import * as util from 'util';

/**
 * Normalize a port into a number, string, or false.
 */
export function normalizePort(val) {
    const port = parseInt(val, 10);
  
    if (isNaN(port)) {
        return val;
    }
  
    if (port >= 0) {
        return port;
    }
  
    return false;
}

process.on('uncaughtException', (err) => {
    console.error(`Crash!! - ${(err.stack || err)}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled Rejection at: ${util.inspect(promise)} reason: ${reason}`);
});
