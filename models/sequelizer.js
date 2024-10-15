import { Sequelize } from 'sequelize';
import { default as jsYaml } from 'js-yaml';
import * as fsModule from 'fs';
import * as util from 'util';
import path from 'path';
import fse from 'fs-extra';

import { appRootDir } from '../app-root-dir.js';
import { log, logError } from '../app-logger.js';

const fs = fsModule.promises;

export default class Sequelizer {

    constructor(sequelConnectConfig) {
        this._sequelizer = null;
        this._sequelConnectConfigFileName = sequelConnectConfig;
    }

    async connect() {
        const configFilePath = await this._getConfigFilePath(this._sequelConnectConfigFileName);
        const sequelizeYaml = await fs.readFile(configFilePath, 'utf8');
        const dbConfig = jsYaml.load(sequelizeYaml);

        dbConfig.dbName         = process.env.DB_NAME    || dbConfig.dbName;
        dbConfig.userName       = process.env.DB_USER    || dbConfig.userName;
        dbConfig.password       = process.env.DB_PWD     || dbConfig.password;
        dbConfig.params.host    = process.env.DB_HOST    || dbConfig.params.host;
        dbConfig.params.port    = process.env.DB_PORT    || dbConfig.params.port;
        dbConfig.params.dialect = process.env.DB_DIALECT || dbConfig.params.dialect;

        log(`Sequelize params: ${util.inspect(dbConfig.params)}`);

        this._sequelizer = new Sequelize(dbConfig.dbName, dbConfig.userName,
                                         dbConfig.password, dbConfig.params);

        try {
            await this._sequelizer.authenticate();
            log('Connection has been established successfully.');
        } catch (error) {
            logError('Unable to connect to the database: ', error);
        }
    }

    async close() {
        if (this._sequelizer) {
            await this._sequelizer.close();
        }
        this._sequelizer = null;
    }

    get instance() { return this._sequelizer; }

    async _getConfigFilePath(sequelConnectConfig) {
        const dir = path.join(appRootDir, 'models');
        await fse.ensureDir(dir);
        return path.join(dir, sequelConnectConfig || `sequelize-sqlite.yaml`);
    }
}

