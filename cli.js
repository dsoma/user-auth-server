// Command-line Tool to use and test REST APIs
import * as Utils from 'util';
import { program } from 'commander';
import { default as restify } from 'restify-clients';

let clientPort;
let clientHost;
let clientProtocol;
let clientVersion = '*';

const authId = 'them';
const authCode = 'd950b890-a8fc-466b-8f47-b8b5aaf7c80c';

// Create a client
const client = (program) => {
    if (typeof process.env.PORT === 'string') {
        clientPort = Number.parseInt(process.env.PORT);
    }

    if (typeof program.port === 'string') {
        clientPort = Number.parseInt(program.port);
    }

    if (typeof program.host === 'string') {
        clientHost = program.host;
    }

    if (typeof program.url === 'string') {
        const url = new URL(program.url);
        if (url?.host) clientHost = url.host;
        if (url?.port) clientPort = url.port;
        if (url?.protocol) clientProtocol = url.protocol;
    }

    let connectUrl = new URL('http://localhost:3001');
    if (clientProtocol) connectUrl.protocol = clientProtocol;
    if (clientHost) connectUrl.host = clientHost;
    if (clientPort) connectUrl.port = clientPort;

    const client = restify.createJSONClient({
        url: connectUrl.href,
        version: clientVersion
    });

    client.basicAuth(authId, authCode);
    return client;
};

const addUser = (username, cmd) => {
    const data = {
        username,
        password: cmd.password,
        familyName: cmd.familyName,
        givenName: cmd.givenName,
        middleName: cmd.middleName,
        emails: [],
        photos: []
    };

    if (cmd.email) {
        data.emails.push(cmd.email);
    }

    client(program).post('/create-user', data, (err, req, res, obj) => {
        if (err) {
            console.error(err.stack);
            return;
        }

        console.log('Created ' + Utils.inspect(obj));
    });
};

const findOrCreateUser = (username, cmd) => {
    const data = {
        username,
        password: cmd.password,
        familyName: cmd.familyName,
        givenName: cmd.givenName,
        middleName: cmd.middleName,
        emails: [],
        photos: [],
        provider: 'local'
    };

    if (cmd.email) {
        data.emails.push(cmd.email);
    }

    client(program).post('/find-or-create', data, (err, req, res, obj) => {
        if (err) {
            console.error(err.stack);
            return;
        }

        console.log('Found or created ' + Utils.inspect(obj));
    });
};

const findUser = (username) => {
    client(program).get(`/find/${username}`, (err, req, res, obj) => {
        if (err) {
            console.error(err.stack);
            return;
        }

        console.log('Found user. Info = ' + Utils.inspect(obj));
    });
};

const listAllUsers = () => {
    client(program).get(`/list`, (err, req, res, obj) => {
        if (err) {
            console.error(err.stack);
            return;
        }

        console.log('User list = ' + Utils.inspect(obj));
    });
};

const updateUser = (username, cmd) => {
    const data = {
        username,
        password: cmd.password,
        familyName: cmd.familyName,
        givenName: cmd.givenName,
        middleName: cmd.middleName,
        emails: [],
        photos: [],
        provider: 'local'
    };

    if (cmd.email) {
        data.emails.push(cmd.email);
    }

    client(program).post(`/update/${username}`, data, (err, req, res, obj) => {
        if (err) {
            console.error(err.stack);
            return;
        }

        console.log('Updated user = ' + Utils.inspect(obj));
    });
};

const deleteUser = (username) => {
    client(program).del(`/delete/${username}`, (err, req, res, obj) => {
        if (err) {
            console.error(err.stack);
            return;
        }

        console.log('Deleted user');
    });
};

program
    .option('-p, --port <port>', 'Port number for user auth service, if using localhost')
    .option('-H, --host <host>', 'Port number for user auth service, if using localhost')
    .option('-u, --url <url>', 'Connection url for user auth service, if using a remote server');

program
    .command('add <username>')
    .description('Add a user to the user server')
    .option('--password <password>', 'Password for new user')
    .option('--family-name <familyName>', 'Family Name (Last name) of the user')
    .option('--given-name <givenName>', 'Given Name (First name) of the user')
    .option('--middle-name <middleName>', 'Middle Name of the user')
    .option('--email <email>', 'Email')
    .action(addUser);

program
    .command('findOrCreate <username>')
    .description('Add a user to the user server')
    .option('--password <password>', 'Password for new user')
    .option('--family-name <familyName>', 'Family Name (Last name) of the user')
    .option('--given-name <givenName>', 'Given Name (First name) of the user')
    .option('--middle-name <middleName>', 'Middle Name of the user')
    .option('--email <email>', 'Email')
    .action(findOrCreateUser);

program
    .command('find <username>')
    .description('Retrieve user info')
    .action(findUser);

program
    .command('list-users')
    .description('List all users')
    .action(listAllUsers);

program
    .command('update <username>')
    .description('Update user info')
    .option('--password <password>', 'Password for user')
    .option('--family-name <familyName>', 'Family Name (Last name) of the user')
    .option('--given-name <givenName>', 'Given Name (First name) of the user')
    .option('--middle-name <middleName>', 'Middle Name of the user')
    .option('--email <email>', 'Email')
    .action(updateUser);

program
    .command('delete <username>')
    .description('Deleting user')
    .action(deleteUser);

program.parse(process.argv);
