import restify from 'restify';
import { default as logger } from 'morgan';

import { appRootDir } from './app-root-dir.js';
import { createLogFileStream, log } from './app-logger.js';
import { normalizePort } from './app-utils.js';
import { authorize } from './auth.js';

const __dirname  = appRootDir;
const APP_PORT   = 3001;
const PORT       = normalizePort(process.env.PORT || APP_PORT);
const LOG_FORMAT = process.env.REQ_LOG_FORMAT || 'dev';

const server = restify.createServer({
    name: 'User-Auth-Service',
    version: '0.1.0'
});

server.use(logger(LOG_FORMAT, { stream: createLogFileStream(__dirname) }));
server.use(restify.plugins.authorizationParser());
server.use(authorize);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: true }));

server.listen(PORT, 'localhost', function () {
    log(server.name + ' listening at ' + server.url);
});
