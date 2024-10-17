import restify from 'restify';
import { default as logger } from 'morgan';
import { default as bcrypt } from 'bcrypt';

import { appRootDir } from './app-root-dir.js';
import { createLogFileStream, log, logError } from './app-logger.js';
import { normalizePort } from './app-utils.js';
import { authorize } from './auth.js';
import UsersSequelizedDB from './models/users-sequelize.js';

const __dirname  = appRootDir;
const APP_PORT   = 3001;
const PORT       = normalizePort(process.env.PORT || APP_PORT);
const LOG_FORMAT = process.env.REQ_LOG_FORMAT || 'dev';

const server = restify.createServer({
    name: 'User-Auth-Service',
    version: '0.1.0'
});

export const userDB = new UsersSequelizedDB(process.env.DB_CONFIG);

server.use(logger(LOG_FORMAT, { stream: createLogFileStream(__dirname) }));
server.use(restify.plugins.authorizationParser());
server.use(authorize);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: true }));

server.listen(PORT, 'localhost', function () {
    log(server.name + ' listening at ' + server.url);
});

// Routes

server.post('/create-user', async (req, res) => {
    try {
        const createdUser = await userDB.createUser(req);
        res.contentType = 'json';
        res.send(createdUser);
    } catch (e) {
        res.send(500, e);
        logError(`Creating user failed with error = ${e}`);
    }
});

server.post('/find-or-create', async (req, res) => {
    try {
        let user = await userDB.findOneUser(req.params?.username);
        if (!user) {
            user = await userDB.createUser(req);
            if (!user) {
                throw new Error(`User could not be created`);
            }
        }
        res.contentType = 'json';
        res.send(user);
    } catch (e) {
        res.send(500, e);
        logError(`Finding user failed with error = ${e}`);
    }
});

server.get('/find/:username', async (req, res) => {
    try {
        let user = await userDB.findOneUser(req.params?.username);
        if (!user) {
            res.send(404, new Error(`No User found with username = ${req.params?.username}`));
            return;
        }

        res.contentType = 'json';
        res.send(user);
    } catch (e) {
        res.send(500, e);
        logError(`Finding user failed with error = ${e}`);
    }
});

server.get('/list', async (req, res) => {
    try {
        res.contentType = 'json';
        res.send(await userDB.findAllUsers());
    } catch (e) {
        res.send(500, e);
        logError(`Finding all users failed with error = ${e}`);
    }
});

server.post('/update/:username', async (req, res) => {
    try {
        const updatedUser = await userDB.updateUser(req);
        if (!updatedUser) {
            throw new Error(`Could not update user ${req.params?.username}`);
        }

        res.contentType = 'json';
        res.send(updatedUser);
    } catch (e) {
        res.send(500, e);
        logError(`Updating user failed with error = ${e}`);
    }
});

server.del('/delete/:username', async (req, res) => {
    try {
        const isDeleted = await userDB.deleteUser(req.params?.username);
        if (!isDeleted) {
            res.send(404, new Error(`No User found with username = ${req.params?.username}`));
            return;
        }

        res.contentType = 'json';
        res.send({});
    } catch (e) {
        res.send(500, e);
        logError(`Deleting user failed with error = ${e}`);
    }
});

server.post('/auth-check', async (req, res) => {
    try {
        const username = req.params?.username;
        const pwd = req.params?.password;
        const user = await userDB.getSqUser(username);

        const result = {
            check: false,
            username,
            message: ''
        };

        let pwCheck = false;

        if (!user) {
            result.message = 'Incorrect username';
        } else if (user.username === username) {
            pwCheck = await bcrypt.compare(pwd, user.password);

            if (pwCheck) {
                result.check = true;
            } else {
                result.message = 'Incorrect password';
            }
        }

        res.contentType = 'json';
        res.send(result);
    } catch (e) {
        res.send(500, e);
        logError(`User auth check error = ${e}`);
    }
});
