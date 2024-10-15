
const apiKeys = [
    { user: 'them', key: 'd950b890-a8fc-466b-8f47-b8b5aaf7c80c' }
];

export function authorize(req, res, next) {
    if (req.authorization?.basic) {
        let found = false;

        for (let auth of apiKeys) {
            if (auth.key === req.authorization.basic.password &&
                auth.user === req.authorization.basic.username) {
                found = true;
                break;
            }
        }

        if (found) {
            next();
        } else {
            res.send(401, new Error('Not authorized'));
            next(false);
        }
    } else {
        res.send(500, new Error('No Authorization Key'));
        next(false);
    }
}
