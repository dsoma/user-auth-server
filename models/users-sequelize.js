import Sequelize from 'sequelize';

import Sequelizer from './sequelizer.js';
import { logError } from '../app-logger.js';

const DataTypes = Sequelize.DataTypes;

export class SQUser extends Sequelize.Model {};

export default class UsersSequelizedDB {

    constructor(sequelizerConfig) {
        this._sequelizer = new Sequelizer(sequelizerConfig);
        this._connected  = false;
    }

    async findOneUser(username) {
        await this._connect();
        let user = await SQUser.findOne({ where: { username } });
        user = user ? UsersSequelizedDB.sanitizedUser(user) : null;
        return user;
    }

    async createUser(req) {
        await this._connect();
        const user = UsersSequelizedDB.getUserFromRequest(req);
        const sqUser = await SQUser.create(user);
        return sqUser ? UsersSequelizedDB.sanitizedUser(sqUser) : null;
    }

    async findAllUsers() {
        await this._connect();
        let users = await SQUser.findAll({});
        return users.map(user => UsersSequelizedDB.sanitizedUser(user));
    }

    async updateUser(req) {
        const username = req.params?.username;

        await this._connect();
        const newUser = UsersSequelizedDB.getUserFromRequest(req);
        if (!newUser) {
            return null;
        }

        await SQUser.update(newUser, { where: { username }});

        let updatedUser = await SQUser.findOne({ where: { username } });
        updatedUser = updatedUser ? UsersSequelizedDB.sanitizedUser(updatedUser) : null;
        return updatedUser;
    }

    async deleteUser(username) {
        await this._connect();

        let user = await SQUser.findOne({ where: { username } });
        if (!user) {
            return false;
        }

        user.destroy();
        return true;
    }

    async destroy(key) {
        try {
            await this._connect();
            await SQNote.destroy({ where: { key }});
        } catch (e) {
            logError(`Could not delete note with key = ${key}. Error = ${e}`);
        }
    }

    async close() {
        if (!this._connected) {
            return;
        }

        await this._sequelizer.close();
        this._connected = false;
    }

    static getUserFromRequest(req) {
        const params = req.params;
        if (!params) {
            return null;
        }

        return {
            provider: params.provider,
            username: params.username,
            password: params.password,
            familyName: params.familyName,
            givenName: params.givenName,
            middleName: params.middleName,
            emails: JSON.stringify(params.emails),
            photos: JSON.stringify(params.photos)
        };
    }

    static sanitizedUser(userData) {
        const user = {
            id: userData.username,
            username: userData.username,
            provider: userData.provider,
            familyName: userData.familyName,
            givenName: userData.givenName,
            middleName: userData.middleName
        };

        try {
            user.emails = JSON.parse(userData.emails);
        } catch (e) {
            user.emails = [];
        }

        try {
            user.photos = JSON.parse(userData.photos);
        } catch (e) {
            user.photos = [];
        }

        return user;
    }

    async _connect() {
        if (this._connected) {
            return;
        }

        await this._sequelizer.connect();

        const userAttrs = {
            username: { type: DataTypes.STRING, primaryKey: true, unique: true },
            password: DataTypes.STRING,
            provider: DataTypes.STRING,
            familyName: DataTypes.STRING,
            givenName: DataTypes.STRING,
            middleName: DataTypes.STRING,
            emails: DataTypes.STRING(2048),
            photos: DataTypes.STRING(2048)
        };

        const options = {
            sequelize: this._sequelizer.instance,
            modelName: 'SQUser'
        };

        SQUser.init(userAttrs, options);

        await SQUser.sync();

        this._connected = true;
    }
}
