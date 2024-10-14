import * as rotFileStream from 'rotating-file-stream';
import * as path from 'path';

import { default as Debugger } from 'debug';

export const log = Debugger('user-auth-server:debug');
export const logError = Debugger('user-auth-server:error');

const LOG_FILE = process.env.REQ_LOG_FILE || 'access.log';

// create a rotating write stream
export const createLogFileStream = (dirName, fileName) => {
    const logFileName = fileName ?? LOG_FILE;
    return rotFileStream.createStream(logFileName, {
        interval: '1d', // rotate daily
        path: path.join(dirName, 'log')
    });
}
