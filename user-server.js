import restify from 'restify';
import { default as logger } from 'morgan';

import { appRootDir } from './app-root-dir.js';
import { createLogFileStream, log, logError } from './app-logger.js';
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

// Routes

server.post('/create-user', (req, res, next) => {
    try {
        // connect db
        log('Creating user . . .');
        res.contentType = 'json';
        res.send({ name: 'foo', password: 'bar' });
    } catch (e) {
        res.send(500, e);
        logError(`Creating user failed with error = ${e}`);
    }

    next(false);
});

server.post('/find-or-create', (req, res, next) => {
    try {
        // connect db
        log('Finding user . . .');
        res.contentType = 'json';
        res.send({ name: 'foo', password: 'bar' });
    } catch (e) {
        res.send(500, e);
        logError(`Finding user failed with error = ${e}`);
    }

    next(false);
});

server.get('/find/:username', (req, res, next) => {
    try {
        // connect db
        log('Finding user . . .');
        res.contentType = 'json';
        res.send({ name: req.params.username, password: 'bar' });
    } catch (e) {
        res.send(500, e);
        logError(`Finding user failed with error = ${e}`);
    }

    next(false);
});

server.get('/list', (req, res, next) => {
    try {
        // connect db
        log('Finding all users . . .');
        res.contentType = 'json';
        res.send([{ name: 'Foo', password: 'bar' }]);
    } catch (e) {
        res.send(500, e);
        logError(`Finding all users failed with error = ${e}`);
    }

    next(false);
});

server.post('/update/:username', (req, res, next) => {
    try {
        // connect db
        log('Updating user . . .');
        res.contentType = 'json';
        res.send({ name: req.params.username, password: 'bar' });
    } catch (e) {
        res.send(500, e);
        logError(`Updating user failed with error = ${e}`);
    }

    next(false);
});

server.del('/delete/:username', (req, res, next) => {
    try {
        // connect db
        log('Deleting user . . .');
        res.contentType = 'json';
        res.send({ name: req.params.username, password: 'bar' });
    } catch (e) {
        res.send(500, e);
        logError(`Deleting user failed with error = ${e}`);
    }

    next(false);
});
